import test from 'node:test';
import assert from 'node:assert/strict';
import Load from '../../../../src/Back/Service/Load.mjs';
import {logger, captureLogs} from '../../../helpers/fakes.mjs';

const input = {root: '/host', pkg: 'plugin', templateName: 'Welcome', vars: {name: 'Alex', count: 0, enabled: false}};
function create(files, logging = logger) {
    return new Load({paths: {act: () => ['/missing', '/fallback']}, logger: logging,
        async readFile(path) {if (!Object.hasOwn(files, path)) throw Object.assign(new Error('absent'), {code: 'ENOENT'}); return files[path];}});
}

test('loads first available template and substitutes false, zero, and named values', async () => {
    const result = await create({'/fallback/meta.json': '{"subject":"Hi {{ name }}"}', '/fallback/body.txt': '{{count}} {{enabled}} {{unknown}}'}).execute(input);
    assert.deepEqual(result, {resultCode: 'SUCCESS', subject: 'Hi Alex', text: '0 false {{unknown}}', html: undefined});
});

test('malformed or bodyless selected templates fail rather than masking deployment errors', async () => {
    for (const files of [{}, {'/fallback/meta.json': 'broken'}, {'/fallback/meta.json': '{}'},
        {'/fallback/meta.json': '{"subject":"Hi"}'}, {'/missing/meta.json': 'bad', '/fallback/meta.json': '{"subject":"fallback"}', '/fallback/body.txt': 'body'}]) {
        assert.equal((await create(files).execute(input)).resultCode, 'UNKNOWN_ERROR');
    }
});

test('HTML-only content works and inherited variable properties are not substituted', async () => {
    const service = create({'/fallback/meta.json': '{"subject":"Hi"}', '/fallback/body.html': '{{inherited}} {{own}}'});
    const vars = Object.assign(Object.create({inherited: 'bad'}), {own: 'ok'});
    assert.equal((await service.execute({...input, vars})).html, '{{inherited}} ok');
});

test('template logs identify fallback and sanitize file/parser failures', async () => {
    const {records, provider} = captureLogs();
    const service = create({'/fallback/meta.json': '{"subject":"private-subject"}', '/fallback/body.txt': 'private-body'}, provider);
    await service.execute(input);
    assert.ok(records.some(({level, message, data}) => level === 'trace' && message.includes('absent') && data.candidateIndex === 1));
    assert.ok(records.some(({level, message, data}) => level === 'debug' && message === 'Email template prepared' && data.candidateIndex === 2));
    await create({'/fallback/meta.json': 'private-invalid-json'}, provider).execute(input);
    const failure = records.find(({level}) => level === 'error');
    assert.equal(failure.data.code, 'EMAIL_TEMPLATE_FAILED');
    assert.equal(failure.data.stage, 'metadata');
    assert.equal(failure.data.err.message, 'EMAIL_TEMPLATE_FAILED');
    const serialized = JSON.stringify(records, (_key, value) => value instanceof Error ? {message: value.message, stack: value.stack} : value);
    for (const privateValue of ['private-subject', 'private-body', 'private-invalid-json', '/host', 'Alex']) {
        assert.ok(!serialized.includes(privateValue));
    }
});
