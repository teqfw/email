/**
 * Possible outcomes of email processing operations.
 * @memberof TeqFw_Email_Back_Service_Send
 */
const RESULT_CODES = {
    SUCCESS: 'SUCCESS',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};
Object.freeze(RESULT_CODES);

/**
 * Handles template-based email preparation and sending.
 */
export default class TeqFw_Email_Back_Service_Send {
    /**
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     * @param {TeqFw_Email_Back_Act_Send} actSend
     * @param {TeqFw_Email_Back_Service_Load} serviceLoad
     */
    constructor(
        {
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Email_Back_Act_Send$: actSend,
            TeqFw_Email_Back_Service_Load$: serviceLoad,
        }
    ) {
        /**
         * Prepares and sends an email using a template.
         *
         * @param {string} to - Recipient's email address.
         * @param {string} pkg - Package associated with the email template.
         * @param {string} templateName - Template identifier.
         * @param {object} [vars={}] - Dynamic content for the template.
         * @param {string} [locale='en-US'] - User's preferred language.
         * @param {string} [localeDef='en-US'] - Default application language.
         * @param {string} [localePlugin='en-US'] - Plugin's default language.
         * @param {object} [headers]
         * @returns {Promise<{resultCode: string}>} Outcome and email content metadata.
         *
         * TODO: email service should not be cared with locales. It should use already ready templates.
         */
        this.execute = async function (
            {
                to,
                pkg,
                templateName,
                vars = {},
                locale = 'en-US',
                localeDef = 'en-US',
                localePlugin = 'en-US',
                headers,
            }
        ) {
            let resultCode = RESULT_CODES.UNKNOWN_ERROR;

            try {
                // Load template and merge dynamic data.
                const {subject, text, html} = await serviceLoad.execute({
                    pkg,
                    templateName,
                    vars,
                    locale,
                    localeDef,
                    localePlugin,
                    headers,
                });

                // Attempt to send the email.
                const {success} = await actSend.act({to, subject, text, html});
                resultCode = success ? RESULT_CODES.SUCCESS : RESULT_CODES.UNKNOWN_ERROR;

                // Log result.
                logger.info(
                    success
                        ? `Email sent successfully to ${to}.`
                        : `Email sending to ${to} failed.`
                );
            } catch (error) {
                logger.exception(error);
            }

            return {resultCode};
        };

        /**
         * Provides possible result codes for the service.
         * @return {typeof TeqFw_Email_Back_Service_Send.RESULT_CODES}
         */
        this.getResultCodes = () => RESULT_CODES;
    }
}
