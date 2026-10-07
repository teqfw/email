import test from 'node:test';
import assert from 'node:assert/strict';
import Message from '../../../src/Back/Message.mjs';

const composer = new Message({randomUUID: () => 'test-id'});
const base = {from: 'sender@example.test', to: 'receiver@example.test', subject: 'Hello', text: 'Line one\n.Line two'};

test('MIME separates headers from body and normalizes Unicode text to base64', () => {
    const wire = composer.build({...base, subject: 'Привет', text: 'текст\n.line'});
    assert.equal(wire.messageId, '<test-id@example.test>');
    assert.equal(wire.from, base.from);
    assert.deepEqual(wire.to, [base.to]);
    const [headers, body] = wire.data.split('\r\n\r\n');
    assert.match(headers, /Subject: =\?UTF-8\?B\?/);
    assert.match(headers, /Content-Type: text\/plain; charset=UTF-8/);
    assert.equal(Buffer.from(body.trim(), 'base64').toString(), 'текст\r\n.line');
    assert.match(composer.build({...base, subject: '', text: ''}).data, /Subject: \r\n/);
});

test('multipart alternative supports named recipients and an HTML part', () => {
    const wire = composer.build({...base, from: 'Отправитель <sender@example.test>', to: ['One <a@example.test>', 'b@example.test'], html: '<b>Hello</b>'});
    assert.deepEqual(wire.to, ['a@example.test', 'b@example.test']);
    assert.match(wire.data, /multipart\/alternative/);
    assert.match(wire.data, /text\/plain/);
    assert.match(wire.data, /text\/html/);
    assert.ok(wire.data.endsWith('--teqfw-test-id--\r\n'));
});

test('long Unicode subjects fold without splitting UTF-8 codepoints', () => {
    const wire = composer.build({...base, subject: '😀'.repeat(100)});
    for (const line of wire.data.split('\r\n')) assert.ok(Buffer.byteLength(line) < 998);
    const encoded = /Subject: ([\s\S]*?)\r\nDate:/.exec(wire.data)[1];
    const decoded = [...encoded.matchAll(/=\?UTF-8\?B\?([^?]*)\?=/g)].map((match) => Buffer.from(match[1], 'base64').toString()).join('');
    assert.equal(decoded, '😀'.repeat(100));
});

test('SMTP command/header injection, invalid mailboxes, and reserved headers reject', () => {
    for (const bad of [{to: 'a@example.test\r\nDATA'}, {from: 'a@example.test> MAIL'},
        {to: 'a..b@example.test'}, {to: 'a@bad..test'}, {to: 'ü@example.test'}, {to: []},
        {subject: 'hello\nBcc: evil@example.test'}, {headers: {Subject: 'override'}},
        {headers: {'X-Extra': 'bad\r\nBcc: evil@example.test'}}, {headers: {'bad:key': 'value'}},
        {text: undefined, html: undefined}]) {
        assert.throws(() => composer.build({...base, ...bad}), /EMAIL_INVALID/);
    }
    assert.match(composer.build({...base, headers: {'X-Application': 'test'}}).data, /X-Application: test/);
});
