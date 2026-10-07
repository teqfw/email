import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import PathsComposer from '../../../../../../src/Back/Service/Load/A/PathsComposer.mjs';

const composer = new PathsComposer({join: path.join, isAbsolute: path.isAbsolute});

test('host templates precede package templates with locale and language fallback', () => {
    const paths = composer.act('/host', '@vendor/plugin', 'Welcome', 'ru-RU', 'en-US', 'es-ES');
    assert.deepEqual(paths.slice(0, 4), ['/host/tmpl/email/ru-ru/Welcome', '/host/tmpl/email/ru/Welcome', '/host/tmpl/email/en-us/Welcome', '/host/tmpl/email/en/Welcome']);
    assert.equal(paths[8], '/host/node_modules/@vendor/plugin/etc/email/ru-ru/Welcome');
    assert.equal(paths.at(-1), '/host/tmpl/email/es/Welcome');
    assert.equal(paths.length, 15);
});

test('duplicate paths are removed and traversal is rejected', () => {
    const paths = composer.act('/host', 'plugin', 'Welcome', 'en', 'en', 'en');
    assert.equal(new Set(paths).size, paths.length);
    for (const args of [['relative', 'plugin', 'Welcome', 'en', 'en', 'en'], ['/host', '../../etc', 'Welcome', 'en', 'en', 'en'],
        ['/host', 'plugin', '../Welcome', 'en', 'en', 'en'], ['/host', 'plugin', 'Welcome', '../en', 'en', 'en']]) {
        assert.throws(() => composer.act(...args), /EMAIL_INVALID_TEMPLATE_PATH/);
    }
});
