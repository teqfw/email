/**
 * Send email message using 'nodemailer' package.
 *
 * @namespace TeqFw_Email_Back_Process_Email
 */
// MODULE'S IMPORT
import nodemailer from 'nodemailer';

// MODULE'S VARS
const NS = 'TeqFw_Email_Back_Process_Email';

// MODULE'S FUNCTIONS
/**
 * Factory to se tup execution context and to create the processor.
 *
 * @param {TeqFw_Di_Shared_SpecProxy} spec
 * @constructs TeqFw_Email_Back_Process_Email.process
 * @memberOf TeqFw_Email_Back_Process_Email
 */
/**
 * @param {TeqFw_Email_Back_Defaults} DEF
 * @param {TeqFw_Core_Shared_Api_Logger} logger -  instance
 * @param {TeqFw_Core_Back_Config} config
 */
function Factory(
    {
        TeqFw_Email_Back_Defaults$: DEF,
        TeqFw_Core_Shared_Api_Logger$$: logger,
        TeqFw_Core_Back_Config$: config,
    }) {
    // PARSE INPUT & DEFINE WORKING VARS
    let transporter, fromDef;

    // FUNCS
    /**
     * Send email.
     * @param {String} [from]
     * @param {String} to
     * @param {String} subject
     * @param {String} text
     * @param {String} html
     * @returns {Promise<boolean>} 'true' if email was sent
     * @memberOf TeqFw_Email_Back_Process_Email
     */
    async function process({from, to, subject, text, html}) {
        let result = false;
        from = from ?? fromDef;
        try {
            // send mail with defined transport object
            const info = await transporter.sendMail({from, to, subject, text, html});
            if (info.messageId) {
                result = true;
                const msgEmail = `Email is sent from '${from}' to '${to}' with subject '${subject}'.`;
                const msgId = `Message ID: ${info.messageId}.`;
                logger.info(`${msgEmail} ${msgId}`);
            }
        } catch (e) {
            const msg = `Cannot send email from '${from}' to '${to}' with subject '${subject}'. Error: ${e.message}`;
            logger.error(msg);
        }
        return result;
    }

    // MAIN
    try {
        // get config for SMTP transport
        /** @type {TeqFw_Email_Back_Plugin_Dto_Config_Local.Dto} */
        const cfg = config.getLocal(DEF.NAME);
        // create reusable transporter object using the default SMTP transport
        transporter = nodemailer.createTransport(cfg);
        // setup default from name
        fromDef = cfg.from ?? cfg.auth.user;
    } catch (e) {
        logger.error(`Cannot initialize SMTP transport. Error: ${e.message}`);
    }

    // COMPOSE RESULT
    Object.defineProperty(process, 'namespace', {value: NS});
    return process;
}

// MODULE'S EXPORT
Object.defineProperty(Factory, 'namespace', {value: NS});
export default Factory;
