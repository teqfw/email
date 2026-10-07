import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const root = fileURLToPath(new URL('../../', import.meta.url));

test('packed package publishes its skill and supports fresh consumer runtime/types', async (t) => {
    const temporary = await fs.mkdtemp('/tmp/teqfw-email-package-');
    t.after(() => fs.rm(temporary, {recursive: true, force: true}));
    const packed = JSON.parse(execFileSync('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', temporary, '--cache', path.join(temporary, 'cache')], {cwd: root, encoding: 'utf8'}))[0];
    const files = packed.files.map(({path}) => path);
    assert.ok(files.includes('types.d.ts'));
    assert.ok(files.includes('.env.example'));
    assert.ok(files.includes('src/Back/Transport/Smtp.mjs'));
    assert.ok(files.includes('skills/teqfw-email/SKILL.md'));
    for (const name of await fs.readdir(path.join(root, 'skills/teqfw-email/references'))) {
        assert.ok(files.includes(`skills/teqfw-email/references/${name}`));
    }
    assert.ok(!files.some((name) => /^(ctx|test|\.agents)\//.test(name)));
    const consumer = path.join(temporary, 'consumer');
    const modules = path.join(consumer, 'node_modules');
    const email = path.join(modules, '@teqfw/email');
    await fs.mkdir(email, {recursive: true});
    execFileSync('tar', ['-xzf', path.join(temporary, packed.filename), '-C', email, '--strip-components=1']);
    const catalog = path.join(consumer, '.agents/skills');
    await fs.mkdir(catalog, {recursive: true});
    await fs.symlink('../../node_modules/@teqfw/email/skills/teqfw-email', path.join(catalog, 'teqfw-email'));
    assert.ok((await fs.stat(path.join(catalog, 'teqfw-email/SKILL.md'))).isFile());
    for (const name of ['cfg', 'di', 'log']) {
        await fs.cp(path.join(root, 'node_modules/@teqfw', name), path.join(modules, '@teqfw', name), {recursive: true});
    }
    for (const name of ['@types/node', 'undici-types']) {
        await fs.cp(path.join(root, 'node_modules', name), path.join(modules, name), {recursive: true});
    }
    await fs.writeFile(path.join(consumer, 'package.json'), JSON.stringify({name: 'email-consumer', type: 'module', dependencies: {'@teqfw/email': '^2.0.0'}}));
    await fs.writeFile(path.join(consumer, 'run.mjs'), `
import fs from 'node:fs/promises';
import path from 'node:path';
import Container from '@teqfw/di';
import NamespaceRegistry from '@teqfw/di/node/registry/namespace';
import assert from 'node:assert/strict';
const entries = await new NamespaceRegistry({fs, path, appRoot: process.cwd()}).build();
const container = new Container({namespaces: entries.map(({prefix, dirAbs, ext}) => ({prefix, target: dirAbs, defaultExt: ext}))});
const source = await container.get('TeqFw_Cfg_Source_Object$');
const loader = await container.get('TeqFw_Cfg_Loader$');
await loader.load([source.create({TEQFW_EMAIL__FROM: 'sender@example.test', TEQFW_EMAIL__SILENT_MODE: true}, 'consumer')]);
const action = await container.get('TeqFw_Email_Back_Act_Send$');
const result = await action.act({to: 'recipient@example.test', subject: 'Test', text: 'Body'});
assert.equal(result.success, true);
assert.equal(result.simulated, true);
await container.get('TeqFw_Email_Back_Service_Send$');
`);
    execFileSync(process.execPath, ['run.mjs'], {cwd: consumer});
    await fs.writeFile(path.join(consumer, 'usage.mjs'), `// @ts-check
/** @param {TeqFw_Email_Back_Act_Send} action @returns {Promise<TeqFw_Email_SendResult>} */
export function submit(action) { return action.act({to: 'a@example.test', subject: 'Test', text: 'Body'}); }
/**
 * @param {TeqFw_Email_Back_Act_Send__Class} Action
 * @param {ConstructorParameters<TeqFw_Email_Back_Act_Send__Class>[0]} deps
 * @returns {TeqFw_Email_Back_Act_Send}
 */
export function createAction(Action, deps) { return new Action(deps); }
`);
    await fs.writeFile(path.join(consumer, 'jsconfig.json'), JSON.stringify({compilerOptions: {checkJs: true, noEmit: true, strict: true, skipLibCheck: true, module: 'nodenext', moduleResolution: 'nodenext', target: 'ES2022', types: ['node']},
        include: ['usage.mjs', 'node_modules/@teqfw/*/types.d.ts', 'node_modules/@teqfw/*/src/**/*.mjs']}));
    execFileSync(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '-p', 'jsconfig.json'], {cwd: consumer});
});
