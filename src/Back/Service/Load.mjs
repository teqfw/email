// @ts-check

/**
 * @namespace TeqFw_Email_Back_Service_Load
 * @description Loads localized templates and performs bounded variable substitution.
 */

const RESULT_CODES = Object.freeze({SUCCESS: 'SUCCESS', UNKNOWN_ERROR: 'UNKNOWN_ERROR'});

export default class Load {
    /**
     * @param {object} deps
     * @param {TeqFw_Email_Back_Service_Load_A_PathsComposer} deps.paths
     * @param {typeof import('node:fs/promises').readFile} deps.readFile
     * @param {TeqFw_Log_Provider} deps.logger
     */
    constructor({paths, readFile, logger}) {
        const log = logger.forSource('TeqFw_Email_Back_Service_Load');
        /**
         * @param {string} source
         * @param {TeqFw_Email_TemplateVars} vars
         * @returns {string}
         */
        const replace = function (source, vars) {
            return source.replace(/{{\s*(\w+)\s*}}/g, (match, name) => Object.hasOwn(vars, name) ? String(vars[name]) : match);
        };
        /**
         * @param {string} path
         * @returns {Promise<string | undefined>}
         */
        const read = async function (path) {
            try { return await readFile(path, 'utf8'); }
            catch (error) {
                if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return undefined;
                throw error;
            }
        };
        /**
         * @param {TeqFw_Email_TemplateInput} input
         * @returns {Promise<TeqFw_Email_TemplateResult>}
         */
        this.execute = async function (input) {
            const {root, pkg, templateName, vars = {}, locale = 'en-US', localeDef = 'en-US', localePlugin = 'en-US'} = input;
            try {
                for (const path of paths.act(root, pkg, templateName, locale, localeDef, localePlugin)) {
                    const meta = await read(`${path}/meta.json`);
                    if (meta === undefined) continue;
                    const parsed = JSON.parse(meta);
                    if (typeof parsed.subject !== 'string') throw new Error('EMAIL_INVALID_TEMPLATE');
                    const text = await read(`${path}/body.txt`);
                    const html = await read(`${path}/body.html`);
                    if (text === undefined && html === undefined) throw new Error('EMAIL_INVALID_TEMPLATE');
                    return {resultCode: RESULT_CODES.SUCCESS, subject: replace(parsed.subject, vars),
                        text: text === undefined ? undefined : replace(text, vars),
                        html: html === undefined ? undefined : replace(html, vars)};
                }
                log.error('Email template not found');
            } catch {
                log.error('Email template preparation failed');
            }
            return {resultCode: RESULT_CODES.UNKNOWN_ERROR};
        };
        /** @returns {TeqFw_Email_ResultCodes} */
        this.getResultCodes = function () { return RESULT_CODES; };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        paths: 'TeqFw_Email_Back_Service_Load_A_PathsComposer$',
        readFile: 'node:fs/promises__readFile',
        logger: 'TeqFw_Log_Provider$',
    }),
});
