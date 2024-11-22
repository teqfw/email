import {config as cfgTest, container} from '@teqfw/test';
import assert from 'assert';

// GET OBJECTS FROM CONTAINER

/** @type {TeqFw_Core_Back_Config} */
const config = await container.get('TeqFw_Core_Back_Config$');
/** @type {TeqFw_Email_Back_Service_Load} */
const service = await container.get('TeqFw_Email_Back_Service_Load$');
const RESULT_CODES = service.getResultCodes();

before(async () => {
    // Initialize environment configuration
    config.init(cfgTest.pathToRoot, '0.0.0');

    // Set up console transport for the logger
    const base = await container.get('TeqFw_Core_Shared_Logger_Base$');
    const transport = await container.get('TeqFw_Core_Shared_Api_Logger_Transport$');
    base.setTransport(transport);
});

describe('TeqFw_Email_Back_Service_Load', () => {
    it('should successfully load the email template with the correct result code', async () => {
        // Test parameters
        const pkg = '@flancer64/gpt-user-auth';
        const templateName = 'SignUp_Init';

        // Execute the service
        const {resultCode, subject, text, html} = await service.execute({pkg, templateName});

        // Assertions
        assert.strictEqual(resultCode, RESULT_CODES.SUCCESS, `Expected SUCCESS result code, but got: ${resultCode}`);
        assert.ok(subject, 'Subject should not be empty');
        assert.ok(text, 'Text content should not be empty');
        assert.ok(html, 'HTML content should not be empty');
    });

    it('should return an error result code when template does not exist', async () => {
        // Test parameters
        const pkg = '@flancer64/nonexistent-package';
        const templateName = 'Nonexistent_Template';

        // Execute the service
        const {resultCode} = await service.execute({pkg, templateName});

        // Assertions
        assert.strictEqual(resultCode, RESULT_CODES.UNKNOWN_ERROR, `Expected NOT_FOUND result code, but got: ${resultCode}`);
    });
});
