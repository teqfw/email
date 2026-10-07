// @ts-check

/**
 * @namespace TeqFw_Email_Config
 * @description Validated immutable SMTP configuration from the package-owned namespace.
 */

export default class Config {
    /**
     * @param {object} deps
     * @param {TeqFw_Cfg_Reader} deps.reader
     */
    constructor({reader}) {
        /** @type {TeqFw_Email_Settings | undefined} */
        let settings;
        /**
         * @returns {TeqFw_Email_Settings}
         */
        this.get = function () {
            if (settings) return settings;
            const raw = reader.get('TEQFW_EMAIL');
            /**
             * @param {string} key
             * @param {string} [fallback]
             * @returns {string}
             */
            const string = function (key, fallback = '') {
                const value = raw[key] ?? fallback;
                if (typeof value !== 'string' || /[\r\n\0]/.test(value)) {
                    throw new Error(`EMAIL_CONFIG_INVALID_${key}`);
                }
                return value;
            };
            /**
             * @param {string} key
             * @param {boolean} fallback
             * @returns {boolean}
             */
            const boolean = function (key, fallback) {
                const value = raw[key] ?? fallback;
                if (value === true || value === 'true') return true;
                if (value === false || value === 'false') return false;
                throw new Error(`EMAIL_CONFIG_INVALID_${key}`);
            };
            /**
             * @param {string} key
             * @param {number} fallback
             * @param {number} max
             * @returns {number}
             */
            const integer = function (key, fallback, max) {
                const value = raw[key] ?? fallback;
                if ((typeof value !== 'number' && typeof value !== 'string') ||
                    (typeof value === 'string' && !/^\d+$/.test(value))) {
                    throw new Error(`EMAIL_CONFIG_INVALID_${key}`);
                }
                const number = Number(value);
                if (!Number.isInteger(number) || number < 1 || number > max) {
                    throw new Error(`EMAIL_CONFIG_INVALID_${key}`);
                }
                return number;
            };
            const secure = boolean('SECURE', true);
            const silentMode = boolean('SILENT_MODE', false);
            const host = string('HOST');
            const user = string('AUTH_USER');
            const pass = string('AUTH_PASS');
            const name = string('CLIENT_NAME', 'localhost');
            if ((!host && !silentMode) || /[\s<>]/.test(host) || !/^[A-Za-z0-9.-]+$/.test(name)) {
                throw new Error('EMAIL_CONFIG_INVALID_HOST_OR_CLIENT_NAME');
            }
            if (Boolean(user) !== Boolean(pass)) throw new Error('EMAIL_CONFIG_INCOMPLETE_AUTH');
            const from = string('FROM', user);
            if (!from) throw new Error('EMAIL_CONFIG_MISSING_FROM');
            settings = Object.freeze({
                host, secure, silentMode, from,
                port: integer('PORT', secure ? 465 : 587, 65535),
                timeoutMs: integer('TIMEOUT_MS', 30000, 2147483647),
                clientName: name,
                auth: user ? Object.freeze({user, pass}) : undefined,
            });
            return settings;
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({reader: 'TeqFw_Cfg_Reader$'}),
});
