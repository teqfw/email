// @ts-check

/**
 * @namespace TeqFw_Email_Back_Service_Send
 * @description Submits localized template content through the email action.
 */

const RESULT_CODES = Object.freeze({SUCCESS: 'SUCCESS', UNKNOWN_ERROR: 'UNKNOWN_ERROR'});

export default class Send {
    /**
     * @param {object} deps
     * @param {TeqFw_Email_Back_Service_Load} deps.load
     * @param {TeqFw_Email_Back_Act_Send} deps.send
     */
    constructor({load, send}) {
        /**
         * @param {TeqFw_Email_TemplateSendInput} input
         * @returns {Promise<TeqFw_Email_TemplateSendResult>}
         */
        this.execute = async function (input) {
            const content = await load.execute(input);
            if (content.resultCode !== RESULT_CODES.SUCCESS || content.subject === undefined) return {resultCode: RESULT_CODES.UNKNOWN_ERROR};
            const result = await send.act({from: input.from, to: input.to, subject: content.subject,
                text: content.text, html: content.html, headers: input.headers});
            return {resultCode: result.success ? RESULT_CODES.SUCCESS : RESULT_CODES.UNKNOWN_ERROR,
                messageId: result.messageId, simulated: result.simulated};
        };
        /** @returns {TeqFw_Email_ResultCodes} */
        this.getResultCodes = function () { return RESULT_CODES; };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({load: 'TeqFw_Email_Back_Service_Load$', send: 'TeqFw_Email_Back_Act_Send$'}),
});
