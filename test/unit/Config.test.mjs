import test from 'node:test';
import assert from 'node:assert/strict';
import Config from '../../src/Config.mjs';

function create(raw) { return new Config({reader: {get(namespace) { assert.equal(namespace, 'TEQFW_EMAIL'); return raw; }}}); }

test('configuration converts strings and freezes settings and credentials', () => {
    const config = create({HOST: 'smtp.example.test', PORT: '587', SECURE: 'false', AUTH_USER: 'a@example.test', AUTH_PASS: 'secret'});
    const cfg = config.get();
    assert.equal(cfg.port, 587);
    assert.equal(cfg.secure, false);
    assert.equal(cfg.from, 'a@example.test');
    assert.equal(cfg.timeoutMs, 30000);
    assert.ok(Object.isFrozen(cfg));
    assert.ok(Object.isFrozen(cfg.auth));
    assert.equal(config.get(), cfg);
});

test('failed early reads do not cache empty pre-load configuration', () => {
    const raw = {};
    const config = create(raw);
    assert.throws(() => config.get(), /EMAIL_CONFIG/);
    Object.assign(raw, {HOST: 'smtp.example.test', FROM: 'sender@example.test'});
    assert.equal(config.get().port, 465);
});

test('invalid settings reject without exposing their values', () => {
    for (const bad of [{PORT: 'bad'}, {PORT: '587.5'}, {PORT: false}, {PORT: 65536}, {TIMEOUT_MS: 0},
        {SECURE: 'FALSE'}, {SILENT_MODE: 1}, {AUTH_USER: 'user'}, {AUTH_PASS: 'secret'},
        {HOST: 'host\r\nINJECT'}, {AUTH_USER: 'user\0other', AUTH_PASS: 'secret'}, {CLIENT_NAME: 'bad name'}]) {
        assert.throws(() => create({HOST: 'smtp.example.test', FROM: 'sender@example.test', ...bad}).get(), /^Error: EMAIL_CONFIG_[A-Z_]+$/);
    }
});

test('explicit simulation needs a sender but not a host', () => {
    assert.equal(create({FROM: 'sender@example.test', SILENT_MODE: true}).get().silentMode, true);
    assert.throws(() => create({SILENT_MODE: true}).get(), /MISSING_FROM/);
});
