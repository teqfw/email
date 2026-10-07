import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import Smtp from '../../../../src/Back/Transport/Smtp.mjs';
import {settings} from '../../../helpers/fakes.mjs';

const message = {from: 'sender@example.test', to: ['a@example.test', 'b@example.test'], messageId: '<id@test>', data: 'From: sender@example.test\r\n\r\n.line\r\n'};

function harness(options = {}) {
    const writes = [];
    const sockets = [];
    const cfg = {...settings, ...options.settings};
    class Socket extends EventEmitter {
        destroyed = false;
        constructor(secure, upgraded = false) {
            super(); this.secure = secure; sockets.push(this);
            setImmediate(() => {this.emit(secure ? 'secureConnect' : 'connect'); if (!upgraded && !options.stall) this.reply(options.greeting ?? '220 fixture\r\n');});
        }
        reply(value) {
            // Exercise framing across packet boundaries.
            const midpoint = Math.floor(value.length / 2);
            this.emit('data', Buffer.from(value.slice(0, midpoint)));
            this.emit('data', Buffer.from(value.slice(midpoint)));
        }
        write(line) {
            writes.push({line, secure: this.secure});
            setImmediate(() => {
                if (this.destroyed) return;
                if (line.startsWith('EHLO')) this.reply(`250-fixture\r\n250-${options.noStarttls ? 'SIZE 100000' : 'STARTTLS'}\r\n250 AUTH ${options.login ? 'LOGIN' : 'PLAIN'}\r\n`);
                else if (line === 'STARTTLS\r\n') this.reply('220 upgrade\r\n');
                else if (line.startsWith('AUTH PLAIN')) this.reply(options.authFail ? '535 denied\r\n' : '235 authorized\r\n');
                else if (line === 'AUTH LOGIN\r\n') this.reply('334 user\r\n');
                else if (line === Buffer.from('user').toString('base64') + '\r\n') this.reply('334 pass\r\n');
                else if (line === Buffer.from('password').toString('base64') + '\r\n') this.reply('235 authorized\r\n');
                else if (line.startsWith('MAIL')) this.reply('250 sender\r\n');
                else if (line.startsWith('RCPT')) this.reply(options.recipientFail && line.includes('b@example') ? '550 denied\r\n' : '250 recipient\r\n');
                else if (line === 'DATA\r\n') this.reply('354 body\r\n');
                else if (line === 'QUIT\r\n') options.quitFail ? this.destroy() : this.reply('221 goodbye\r\n');
                else if (options.dropDataReply) this.destroy();
                else this.reply(options.rejectData ? '554 denied\r\n' : '250 queued\r\n');
            });
            return true;
        }
        destroy(error) {
            if (this.destroyed) return this;
            this.destroyed = true;
            if (error) this.emit('error', error);
            this.emit('close');
            return this;
        }
    }
    const smtp = new Smtp({config: {get: () => cfg}, isIP: () => 0,
        connect() {return new Socket(false);},
        tlsConnect(opts) {assert.equal(opts.rejectUnauthorized, true); assert.equal(opts.minVersion, 'TLSv1.2'); return new Socket(true, Boolean(opts.socket));}});
    return {smtp, writes, sockets};
}

test('STARTTLS repeats EHLO, authenticates on TLS, and dot-stuffs DATA', async () => {
    const {smtp, writes, sockets} = harness();
    await smtp.send(message);
    assert.equal(writes.filter(({line}) => line.startsWith('EHLO')).length, 2);
    const auth = writes.find(({line}) => line.startsWith('AUTH'));
    assert.ok(auth.secure);
    assert.equal(Buffer.from(auth.line.trim().split(' ')[2], 'base64').toString(), '\0user\0password');
    assert.ok(writes.some(({line}) => line.includes('\r\n..line\r\n.\r\n')));
    assert.ok(sockets.at(-1).destroyed);
    assert.equal(sockets.at(-1).listenerCount('data'), 0);
});

test('implicit TLS and AUTH LOGIN work without STARTTLS', async () => {
    const {smtp, writes} = harness({settings: {secure: true}, login: true});
    await smtp.send(message);
    assert.ok(writes.every(({secure}) => secure));
    assert.ok(!writes.some(({line}) => line === 'STARTTLS\r\n'));
    assert.ok(writes.some(({line}) => line === 'AUTH LOGIN\r\n'));
});

test('missing STARTTLS and failed AUTH/recipient/data replies reject before unsafe continuation', async () => {
    for (const options of [{noStarttls: true}, {authFail: true}, {recipientFail: true}, {rejectData: true}]) {
        const {smtp, writes, sockets} = harness(options);
        await assert.rejects(smtp.send(message), /EMAIL_SMTP_/);
        if (options.noStarttls) assert.ok(!writes.some(({line}) => line.startsWith('AUTH')));
        if (options.recipientFail || options.authFail) assert.ok(!writes.some(({line}) => line === 'DATA\r\n'));
        assert.ok(sockets.at(-1).destroyed);
    }
});

test('lost DATA acknowledgment reports unknown outcome while failed QUIT retains acceptance', async () => {
    await assert.rejects(harness({dropDataReply: true}).smtp.send(message), /EMAIL_SMTP_OUTCOME_UNKNOWN/);
    await harness({quitFail: true}).smtp.send(message);
});

test('operation deadline and malformed greetings terminate and release sockets', async () => {
    const stalled = harness({stall: true, settings: {timeoutMs: 20}});
    await assert.rejects(stalled.smtp.send(message), /EMAIL_SMTP_TIMEOUT/);
    assert.ok(stalled.sockets[0].destroyed);
    await assert.rejects(harness({greeting: '220-welcome\r\n250 wrong\r\n'}).smtp.send(message), /EMAIL_SMTP_INVALID_REPLY/);
});
