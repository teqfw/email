import {container} from '@teqfw/test';
import assert from 'assert';
import path from 'node:path';

// GET OBJECTS FROM CONTAINER
/** @type {TeqFw_Email_Back_Service_Load_A_PathsComposer} */
const action = await container.get('TeqFw_Email_Back_Service_Load_A_PathsComposer$');

/** @type {TeqFw_Core_Back_Config} */
const config = await container.get('TeqFw_Core_Back_Config$');

// Mock the `getPathToRoot` method
config.getPathToRoot = () => '/path/to/root';

describe('TeqFw_Email_Back_Service_Load_A_PathsComposer', () => {
    it('should generate correct paths for given locales and package information', () => {
        // Test data
        const pkg = '@flancer64/gpt-user-auth';
        const templateName = 'SignUp_Init';
        const locale = 'ru-RU';
        const localeDef = 'en-US';
        const localePlugin = 'es-ES';

        // Expected paths
        const rootPath = '/path/to/root/etc/email';
        const expectedPaths = [
            path.join(rootPath, 'ru-ru', pkg, templateName),
            path.join(rootPath, 'ru', pkg, templateName),
            path.join(rootPath, 'en-us', pkg, templateName),
            path.join(rootPath, 'en', pkg, templateName),
            path.join(rootPath, 'node_modules', pkg, 'ru-ru', templateName),
            path.join(rootPath, 'node_modules', pkg, 'ru', templateName),
            path.join(rootPath, 'node_modules', pkg, 'en-us', templateName),
            path.join(rootPath, 'node_modules', pkg, 'en', templateName),
            path.join(rootPath, 'node_modules', pkg, 'es-es', templateName),
            path.join(rootPath, 'node_modules', pkg, 'es', templateName),
        ];

        // Call the method
        const paths = action.act(pkg, templateName, locale, localeDef, localePlugin);

        // Assert
        assert.deepStrictEqual(paths, expectedPaths, 'Generated paths do not match the expected ones.');
    });
});
