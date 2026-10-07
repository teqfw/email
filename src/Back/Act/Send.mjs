// @ts-check

/**
 * @namespace TeqFw_Email_Back_Act_Send
 * @description Submits prepared email with sanitized outcomes and source-bound logging.
 */

export default class Send {
    /**
     * @param {object} deps
     * @param {TeqFw_Email_Config} deps.config
     * @param {TeqFw_Email_Back_Message} deps.message
     * @param {TeqFw_Email_Back_Transport_Smtp} deps.smtp
     * @param {TeqFw_Log_Provider} deps.logger
     */
    constructor({config, message, smtp, logger}) {
        const log = logger.forSource('TeqFw_Email_Back_Act_Send');
        /**
         * @param {TeqFw_Email_MessageInput} input
         * @returns {Promise<TeqFw_Email_SendResult>}
         */
        this.act = async function (input) {
            try {
                const settings = config.get();
                const prepared = message.build({...input, from: input.from ?? settings.from});
                if (settings.silentMode) {
                    log.info('Email submission simulated');
                    return {success: true, simulated: true, messageId: prepared.messageId};
                }
                await smtp.send(prepared);
                log.info('Email submission accepted', {messageId: prepared.messageId});
                return {success: true, messageId: prepared.messageId};
            } catch (error) {
                const code = error instanceof Error && /^EMAIL_[A-Z0-9_]+$/.test(error.message) ? error.message : 'EMAIL_SEND_FAILED';
                log.error('Email submission failed', {err: new Error(code)});
                return {success: false, error: code};
            }
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        config: 'TeqFw_Email_Config$',
        message: 'TeqFw_Email_Back_Message$',
        smtp: 'TeqFw_Email_Back_Transport_Smtp$',
        logger: 'TeqFw_Log_Provider$',
    }),
});
