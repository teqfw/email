import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import tls from 'node:tls';
import {fileURLToPath} from 'node:url';
import Container from '@teqfw/di';
import NamespaceRegistry from '@teqfw/di/node/registry/namespace';
import {smtpServer, cert} from '../helpers/smtp-server.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
async function composition(values, trusted = true, records) {
    const entries = await new NamespaceRegistry({fs, path, appRoot: root}).build();
    assert.ok(entries.some(({prefix}) => prefix === 'TeqFw_Email_'));
    const container = new Container({namespaces: entries.map(({prefix, dirAbs, ext}) => ({prefix, target: dirAbs, defaultExt: ext}))});
    if (trusted) {
        container.enableTestMode();
        container.register('node:tls__connect', (options) => tls.connect({...options, ca: cert}));
    }
    if (records) {
        container.enableTestMode();
        container.register('TeqFw_Log_Console_Writer$', {write(record) {records.push(record);}});
    }
    const source = await container.get('TeqFw_Cfg_Source_Object$');
    const loader = await container.get('TeqFw_Cfg_Loader$');
    await loader.load([source.create(values, 'integration')]);
    return container;
}

for (const implicit of [false, true]) {
    test(`real DI, cfg, logging, MIME, and ${implicit ? 'implicit TLS' : 'STARTTLS'} submit UTF-8 content`, async (t) => {
        const server = await smtpServer({implicit});
        t.after(() => server.close());
        const container = await composition({TEQFW_EMAIL__HOST: '127.0.0.1', TEQFW_EMAIL__PORT: server.port,
            TEQFW_EMAIL__SECURE: implicit, TEQFW_EMAIL__AUTH_USER: 'user', TEQFW_EMAIL__AUTH_PASS: 'password',
            TEQFW_EMAIL__FROM: 'Sender <sender@example.test>', TEQFW_EMAIL__TIMEOUT_MS: 2000});
        const action = await container.get('TeqFw_Email_Back_Act_Send$');
        const result = await action.act({to: ['one@example.test', 'two@example.test'], subject: 'Привет', text: 'Текст', html: '<b>Hello</b>'});
        assert.equal(result.success, true, result.error);
        assert.ok(result.messageId);
        assert.equal(server.messages.length, 1);
        const data = server.messages[0].join('\r\n');
        assert.ok(data.includes(`Message-ID: ${result.messageId}`));
        assert.match(data, /multipart\/alternative/);
        assert.ok(server.commands.find(({line}) => line.startsWith('AUTH')).secure);
        assert.equal(server.commands.filter(({line}) => line.startsWith('EHLO')).length, implicit ? 1 : 2);
        // All public DI components resolve through published namespace metadata.
        await container.get('TeqFw_Email_Back_Service_Send$');
    });
}

test('real SMTP rejects missing STARTTLS, authentication, recipients, and untrusted certificates', async (t) => {
    for (const scenario of [{advertiseStarttls: false}, {failAuth: true}, {rejectRecipient: true}, {implicit: true, untrusted: true}]) {
        const server = await smtpServer(scenario);
        try {
            const container = await composition({TEQFW_EMAIL__HOST: '127.0.0.1', TEQFW_EMAIL__PORT: server.port,
                TEQFW_EMAIL__SECURE: scenario.implicit ?? false, TEQFW_EMAIL__AUTH_USER: 'user', TEQFW_EMAIL__AUTH_PASS: 'password',
                TEQFW_EMAIL__FROM: 'sender@example.test', TEQFW_EMAIL__TIMEOUT_MS: 2000}, !scenario.untrusted);
            const action = await container.get('TeqFw_Email_Back_Act_Send$');
            const result = await action.act({to: 'a@example.test', subject: 'Hi', text: 'body'});
            assert.equal(result.success, false);
            assert.equal(server.messages.length, 0);
            if (scenario.advertiseStarttls === false) assert.ok(!server.commands.some(({line}) => line.startsWith('AUTH')));
        } finally {await server.close();}
    }
});

test('real AUTH LOGIN and localized template submission retain the service workflow', async (t) => {
    const server = await smtpServer({implicit: true, login: true});
    t.after(() => server.close());
    const templateRoot = await fs.mkdtemp('/tmp/teqfw-email-templates-');
    t.after(() => fs.rm(templateRoot, {recursive: true, force: true}));
    const template = path.join(templateRoot, 'tmpl/email/en/Welcome');
    await fs.mkdir(template, {recursive: true});
    await fs.writeFile(path.join(template, 'meta.json'), '{"subject":"Hello {{name}}"}');
    await fs.writeFile(path.join(template, 'body.txt'), 'Welcome {{name}}');
    const container = await composition({TEQFW_EMAIL__HOST: '127.0.0.1', TEQFW_EMAIL__PORT: server.port, TEQFW_EMAIL__SECURE: true,
        TEQFW_EMAIL__AUTH_USER: 'user', TEQFW_EMAIL__AUTH_PASS: 'password', TEQFW_EMAIL__FROM: 'sender@example.test', TEQFW_EMAIL__TIMEOUT_MS: 2000});
    const service = await container.get('TeqFw_Email_Back_Service_Send$');
    const result = await service.execute({root: templateRoot, pkg: 'plugin', templateName: 'Welcome', locale: 'fr-FR', to: 'a@example.test', vars: {name: 'Alex'}});
    assert.equal(result.resultCode, 'SUCCESS');
    assert.equal(server.messages.length, 1);
    assert.match(server.messages[0].join('\r\n'), /V2VsY29tZSBBbGV4/);
});

test('host mapping loads APP dotenv settings into the package namespace without reading process.env', async (t) => {
    const directory = await fs.mkdtemp('/tmp/teqfw-email-dotenv-');
    t.after(() => fs.rm(directory, {recursive: true, force: true}));
    await fs.writeFile(path.join(directory, '.env'), 'APP__EMAIL_HOST=smtp.example.test\nAPP__EMAIL_PORT=587\nAPP__EMAIL_SECURE=false\nAPP__EMAIL_AUTH_USER=sender@example.test\nAPP__EMAIL_AUTH_PASS=test-only-password\nAPP__EMAIL_TO=recipient@example.test\n');
    const mappings = await new NamespaceRegistry({fs, path, appRoot: root}).build();
    const container = new Container({namespaces: mappings.map(({prefix, dirAbs, ext}) => ({prefix, target: dirAbs, defaultExt: ext}))});
    const dotenv = await container.get('TeqFw_Cfg_Source_DotenvFile$');
    const source = dotenv.create({path: path.join(directory, '.env'), id: 'application-dotenv'});
    const map = {APP__EMAIL_HOST: 'TEQFW_EMAIL__HOST', APP__EMAIL_PORT: 'TEQFW_EMAIL__PORT', APP__EMAIL_SECURE: 'TEQFW_EMAIL__SECURE',
        APP__EMAIL_AUTH_USER: 'TEQFW_EMAIL__AUTH_USER', APP__EMAIL_AUTH_PASS: 'TEQFW_EMAIL__AUTH_PASS'};
    const loader = await container.get('TeqFw_Cfg_Loader$');
    await loader.load([{id: 'application-email-mapping', async load() {
        const entries = await source.load();
        return [...entries, ...entries.filter(({key}) => Object.hasOwn(map, key)).map(({key, value}) => ({key: map[key], value}))];
    }}]);
    const config = await container.get('TeqFw_Email_Config$');
    assert.equal(config.get().host, 'smtp.example.test');
    assert.equal(config.get().port, 587);
    assert.equal(config.get().secure, false);
    assert.equal(config.get().from, 'sender@example.test');
    const reader = await container.get('TeqFw_Cfg_Reader$');
    assert.equal(reader.get('APP').EMAIL_TO, 'recipient@example.test');
    assert.equal(reader.get('TEQFW_EMAIL').TO, undefined);
});

test('host logging Policy controls existing email loggers at runtime', async () => {
    const records = [];
    const container = await composition({TEQFW_EMAIL__FROM: 'sender@example.test', TEQFW_EMAIL__SILENT_MODE: true}, true, records);
    const action = await container.get('TeqFw_Email_Back_Act_Send$');
    const policy = await container.get('TeqFw_Log_Policy$');
    const input = {to: 'private-recipient@example.test', subject: 'private-subject', text: 'private-body'};
    await action.act(input);
    assert.deepEqual(records.map(({level}) => level), ['info']);
    records.length = 0;
    policy.setRules({'*': 'info', 'TeqFw_Email_*': 'debug'});
    await action.act(input);
    assert.ok(records.some(({level}) => level === 'debug'));
    assert.ok(records.every(({source}) => source === 'TeqFw_Email_Back_Act_Send'));
    const count = records.length;
    policy.setRule('TeqFw_Email_*', 'none');
    await action.act(input);
    assert.equal(records.length, count);
    for (const sensitive of ['private-recipient', 'private-subject', 'private-body']) {
        assert.ok(!JSON.stringify(records).includes(sensitive));
    }
});
