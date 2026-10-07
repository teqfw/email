import test from 'node:test';
import assert from 'node:assert/strict';
import Send from '../../../../src/Back/Service/Send.mjs';
import {logger} from '../../../helpers/fakes.mjs';

test('does not submit failed template preparation', async () => {
    const service = new Send({logger, load: {async execute() {return {resultCode: 'UNKNOWN_ERROR'};}}, send: {async act() {assert.fail('must not submit');}}});
    assert.deepEqual(await service.execute({}), {resultCode: 'UNKNOWN_ERROR'});
});

test('forwards headers and reports actual submission outcomes', async () => {
    for (const success of [true, false]) {
        const service = new Send({logger, load: {async execute() {return {resultCode: 'SUCCESS', subject: 'Hi', text: 'body'};}},
            send: {async act(input) {assert.equal(input.headers['X-App'], 'test'); assert.equal(input.to, 'a@test'); return {success, messageId: success ? '<id@test>' : undefined};}}});
        const result = await service.execute({to: 'a@test', headers: {'X-App': 'test'}});
        assert.equal(result.resultCode, success ? 'SUCCESS' : 'UNKNOWN_ERROR');
        assert.equal(result.messageId, success ? '<id@test>' : undefined);
    }
});
