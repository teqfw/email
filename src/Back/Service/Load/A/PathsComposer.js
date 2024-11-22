import {join, sep} from 'node:path';

export default class TeqFw_Email_Back_Service_Load_A_PathsComposer {
    /**
     * @param {TeqFw_Core_Back_Config} config
     */
    constructor(
        {
            TeqFw_Core_Back_Config$: config,
        }
    ) {
        /**
         * Generates all possible paths for searching an email template based on locales and package information.
         *
         * @param {string} pkg - The name of the package containing the template.
         * @param {string} templateName - The name of the email template to load.
         * @param {string} locale - The desired locale of the user (e.g., 'ru-RU').
         * @param {string} localeDef - The default locale of the application (e.g., 'en-US').
         * @param {string} localePlugin - The default locale of the plugin (e.g., 'es-ES').
         * @returns {string[]} An array of paths ordered by priority for template searching.
         */
        this.act = function (pkg, templateName, locale, localeDef, localePlugin) {
            const res = [];

            // Normalize the package name to use the correct path separators for the platform
            const normalizedPkg = pkg.replace(/\//g, sep);

            const rootApp = join(config.getPathToRoot(), 'etc', 'email');
            const rootPlugin = join(config.getPathToRoot(), 'node_modules', normalizedPkg, 'etc', 'email');

            // Add paths based on the desired locale at the application level
            const pathUserLocale = join(rootApp, locale.toLowerCase(), normalizedPkg, templateName);
            res.push(pathUserLocale);

            // Add paths based on the desired language at the application level
            const lang = locale.split('-')[0];
            const pathUserLanguage = join(rootApp, lang.toLowerCase(), normalizedPkg, templateName);
            res.push(pathUserLanguage);

            // Add paths based on the default locale at the application level
            const pathDefaultLocale = join(rootApp, localeDef.toLowerCase(), normalizedPkg, templateName);
            res.push(pathDefaultLocale);

            // Add paths based on the default language at the application level
            const langDef = localeDef.split('-')[0];
            const pathDefaultLanguage = join(rootApp, langDef.toLowerCase(), normalizedPkg, templateName);
            res.push(pathDefaultLanguage);

            // Add paths based on the desired locale at the plugin level
            const pathPluginUserLocale = join(rootPlugin, locale.toLowerCase(), templateName);
            res.push(pathPluginUserLocale);

            // Add paths based on the desired language at the plugin level
            const pathPluginUserLanguage = join(rootPlugin, lang.toLowerCase(), templateName);
            res.push(pathPluginUserLanguage);

            // Add paths based on the default locale at the plugin level
            const pathPluginDefaultLocale = join(rootPlugin, localeDef.toLowerCase(), templateName);
            res.push(pathPluginDefaultLocale);

            // Add paths based on the default language at the plugin level
            const pathPluginDefaultLanguage = join(rootPlugin, langDef.toLowerCase(), templateName);
            res.push(pathPluginDefaultLanguage);

            // Add paths based on the default locale of the plugin
            const pathPluginLocale = join(rootPlugin, localePlugin.toLowerCase(), templateName);
            res.push(pathPluginLocale);

            // Add paths based on the default language of the plugin
            const langPlugin = localePlugin.split('-')[0];
            const pathPluginLanguage = join(rootPlugin, langPlugin.toLowerCase(), templateName);
            res.push(pathPluginLanguage);

            return res;
        };
    }
}
