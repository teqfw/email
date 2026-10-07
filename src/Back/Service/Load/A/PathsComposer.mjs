// @ts-check

/**
 * @namespace TeqFw_Email_Back_Service_Load_A_PathsComposer
 * @description Produces bounded locale fallback paths under an explicit host root.
 */

export default class PathsComposer {
    /**
     * @param {object} deps
     * @param {typeof import('node:path').join} deps.join
     * @param {typeof import('node:path').isAbsolute} deps.isAbsolute
     */
    constructor({join, isAbsolute}) {
        /**
         * @param {string} root
         * @param {string} pkg
         * @param {string} templateName
         * @param {string} locale
         * @param {string} localeDef
         * @param {string} localePlugin
         * @returns {Array<string>}
         */
        this.act = function (root, pkg, templateName, locale, localeDef, localePlugin) {
            if (typeof root !== 'string' || !isAbsolute(root) ||
                !/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(pkg) ||
                !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(templateName) ||
                ![locale, localeDef, localePlugin].every((value) => /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(value))) {
                throw new Error('EMAIL_INVALID_TEMPLATE_PATH');
            }
            const app = join(root, 'tmpl', 'email');
            const plugin = join(root, 'node_modules', pkg, 'etc', 'email');
            const locales = [locale.toLowerCase(), locale.split('-')[0].toLowerCase(),
                localeDef.toLowerCase(), localeDef.split('-')[0].toLowerCase()];
            const pluginLocales = [...locales, localePlugin.toLowerCase(), localePlugin.split('-')[0].toLowerCase()];
            return [...new Set([
                ...locales.map((value) => join(app, value, templateName)),
                ...locales.map((value) => join(app, value, pkg, templateName)),
                ...pluginLocales.map((value) => join(plugin, value, templateName)),
                join(app, localePlugin.split('-')[0].toLowerCase(), templateName),
            ])];
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({join: 'node:path__join', isAbsolute: 'node:path__isAbsolute'}),
});
