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
 * Factory to setup execution context and to create the processor.
 *
 * @param {TeqFw_Di_SpecProxy} spec
 * @constructs TeqFw_Email_Back_Process_Email.process
 * @memberOf TeqFw_Email_Back_Process_Email
 */
function Factory(spec) {
    /** @type {TeqFw_Email_Defaults} */
    const DEF = spec['TeqFw_Email_Defaults$']; // instance singleton
    /** @type {TeqFw_Core_App_Logger} */
    const logger = spec['TeqFw_Core_App_Logger$']; // instance singleton
    /** @type {TeqFw_Core_App_Front_Data_Config} */
    const config = spec[DEF.MOD_CORE.DI_CONFIG]; // named singleton

    // PARSE INPUT & DEFINE WORKING VARS
    let transporter, fromDef;

    // DEFINE INNER FUNCTIONS
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

    // MAIN FUNCTIONALITY
    try {
        // get config for SMTP transport
        /** @type {TeqFw_Email_Api_Config} */
        const cfg = config?.local?.email;
        // create reusable transporter object using the default SMTP transport
        transporter = nodemailer.createTransport(cfg);
        // setup default from name
        fromDef = cfg.from ?? cfg.auth.user;
    } catch (e) {
        logger.error(`Cannot initialize SMTP transport. Error: ${e.message}`);
    }

    // COMPOSE RESULT
    Object.defineProperty(process, 'name', {value: `${NS}.${process.name}`});
    return process;
}

// MODULE'S EXPORT
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.name}`});
export default Factory;
