/**
 * Send email.
 */
// MODULE'S IMPORT
import nodemailer from 'nodemailer';

// MODULE'S CLASSES
/**
 * @implements TeqFw_Core_Shared_Api_Act
 */
export default class TeqFw_Email_Back_Act_Send {
    /**
     * @param {TeqFw_Email_Back_Defaults} DEF
     * @param {TeqFw_Core_Shared_Api_Logger} logger -  instance
     * @param {TeqFw_Core_Back_Config} config
     */
    constructor(
        {
            TeqFw_Email_Back_Defaults$: DEF,
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Core_Back_Config$: config,
        }
    ) {
        // VARS
        let _transporter, _fromDef;

        // MAIN
        /**
         * The action itself.
         * @param {String} [from]
         * @param {String} to
         * @param {String} subject
         * @param {String} text
         * @param {String} html
         * @return {Promise<{success:boolean, messageId: string}>}
         */
        this.act = async function ({from, to, subject, text, html}) {
            let success = false;
            /** @type {string} */
            let messageId;
            try {
                from = from ?? _fromDef;
                // send mail with defined transport object
                const info = await _transporter.sendMail({from, to, subject, text, html});
                if (info.messageId) {
                    messageId = info.messageId;
                    success = true;
                    const msgEmail = `Email is sent from '${from}' to '${to}' with subject '${subject}'.`;
                    const msgId = `Message ID: ${info.messageId}.`;
                    logger.info(`${msgEmail} ${msgId}`);
                }
            } catch (e) {
                const msg = `Cannot send email from '${from}' to '${to}' with subject '${subject}'. Error: ${e.message}`;
                logger.error(msg);
            }
            return {success, messageId};
        };

        try {
            // get config for SMTP transport
            /** @type {TeqFw_Email_Back_Plugin_Dto_Config_Local.Dto} */
            const cfg = config.getLocal(DEF.NAME);
            // create reusable transporter object using the default SMTP transport
            _transporter = nodemailer.createTransport(cfg);
            // setup default from name
            _fromDef = cfg?.from ?? cfg?.auth?.user;
        } catch (e) {
            logger.error(`Cannot initialize SMTP transport. Error: ${e.message}`);
        }
    }

}