import test from 'node:test';
import assert from 'node:assert/strict';
import Send from '../../../../src/Back/Act/Send.mjs';
import {settings} from '../../../helpers/fakes.mjs';

function create(overrides = {}) {
    const calls = [];
    const logs = [];
    const dependencies = {
        config: {get: () => settings},
        message: {build(input) {calls.push(input); return {messageId: '<id@test>', data: '', from: input.from, to: [input.to]};}},
        smtp: {async send(wire) {calls.push(wire);}},
        logger: {forSource(source) {assert.equal(source, 'TeqFw_Email_Back_Act_Send'); return {trace(...args) {logs.push(args);}, debug(...args) {logs.push(args);}, warn(...args) {logs.push(args);}, info(...args) {logs.push(args);}, error(...args) {logs.push(args);}};}},
        ...overrides,
    };
    return {action: new Send(dependencies), calls, logs};
}

test('uses default sender and only reports success after accepted submission', async () => {
    const {action, calls} = create();
    assert.deepEqual(await action.act({to: 'a@test', subject: 'Test', text: 'body'}), {success: true, messageId: '<id@test>'});
    assert.equal(calls[0].from, settings.from);
    assert.equal(calls.length, 2);
});

test('explicit simulation validates the message and skips transport', async () => {
    const {action, calls} = create({config: {get: () => ({...settings, silentMode: true})}});
    const result = await action.act({from: 'custom@test', to: 'a@test', subject: 'Test', html: '<p>Hello</p>'});
    assert.equal(result.simulated, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].from, 'custom@test');
});

test('transport/config/content errors are sanitized in outcomes and logs', async () => {
    for (const message of ['EMAIL_SMTP_REJECTED_535', 'secret password and private body']) {
        const {action, logs} = create({smtp: {async send() {throw new Error(message);}}});
        const result = await action.act({to: 'a@test', subject: 'private', text: 'private'});
        assert.equal(result.success, false);
        assert.equal(result.error, message.startsWith('EMAIL_') ? message : 'EMAIL_SEND_FAILED');
        assert.equal(result.messageId, undefined);
        assert.equal(logs.find((entry) => entry[0] === 'Email submission failed')[1].err.message, result.error);
        assert.ok(!JSON.stringify(logs).includes('password'));
    }
});

test('action diagnostics correlate preparation and acceptance without message fields', async () => {
    const {action, logs} = create();
    await action.act({to: 'private-recipient@test', subject: 'private-subject', text: 'private-body'});
    const prepared = logs.find(([message]) => message === 'Email message prepared')[1];
    const accepted = logs.find(([message]) => message === 'Email submission accepted')[1];
    assert.equal(prepared.recipientCount, 1);
    assert.equal(prepared.messageId, accepted.messageId);
    assert.ok(accepted.durationMs >= 0);
    const serialized = JSON.stringify(logs);
    for (const privateValue of ['private-recipient', 'private-subject', 'private-body', settings.from]) {
        assert.ok(!serialized.includes(privateValue));
    }
});
