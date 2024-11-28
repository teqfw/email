import {access, readFile} from 'node:fs/promises';

/**
 * Enumeration of possible result codes for email loading operations.
 * @memberof TeqFw_Email_Back_Service_Load
 */
const RESULT_CODES = {
    SUCCESS: 'SUCCESS',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};
Object.freeze(RESULT_CODES);

/**
 * This class handles loading and rendering email templates with dynamic data.
 */
export default class TeqFw_Email_Back_Service_Load {
    /**
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     * @param {TeqFw_Email_Back_Dto_Tmpl_Meta} dtoMeta
     * @param {TeqFw_Email_Back_Service_Load_A_PathsComposer} aPathsComposer
     */
    constructor(
        {
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Email_Back_Dto_Tmpl_Meta$: dtoMeta,
            TeqFw_Email_Back_Service_Load_A_PathsComposer$: aPathsComposer,
        }
    ) {
        // VARS
        // FUNCS
        /**
         * Checks if a given path exists and is accessible.
         *
         * @param {string} filePath - The path to the file or directory to check.
         * @returns {Promise<boolean>} Resolves to `true` if the path exists, otherwise `false`.
         */
        async function pathExists(filePath) {
            try {
                await access(filePath);
                return true;
            } catch {
                return false;
            }
        }


        /**
         * Loads metadata from the first existing path in the provided list.
         *
         * @param {string[]} paths - An array of paths to check for the metadata file.
         * @returns {Promise<{foundPath: string|null, dto: TeqFw_Email_Back_Dto_Tmpl_Meta.Dto|null}>}
         * An object containing the found path and the DTO with metadata if successful, otherwise `null` values.
         */
        async function loadMeta(paths) {
            let foundPath = null, dto = null;
            try {
                // Find the first existing path
                for (const path of paths) {
                    if (await pathExists(path)) {
                        foundPath = path;
                        break;
                    }
                }
                if (foundPath) {
                    const metaFilePath = `${foundPath}/meta.json`;
                    const metaContent = await readFile(metaFilePath, 'utf8');
                    const metaData = JSON.parse(metaContent);
                    dto = dtoMeta.createDto(metaData);
                }
            } catch (error) {
                logger.exception(error);
            }
            return {foundPath, dto};
        }


        /**
         * Replaces variables in the template with their corresponding values.
         * Variables in the template should be in the format {{variableName}}.
         * @param {string} template - The template string with placeholders.
         * @param {object} vars - The key-value pairs for variable substitution.
         * @returns {string} The template with variables replaced by their values.
         */
        function replaceVariables(template, vars) {
            return template.replace(/{{(\w+)}}/g, (match, varName) => {
                return vars[varName] !== undefined ? vars[varName] : match;
            });
        }

        // MAIN

        /**
         * Loads an email template and its metadata based on application and plugin locales.
         *
         * @param {string} pkg - The name of the package containing the template (used for plugin-level defaults).
         * @param {string} templateName - The name of the email template to load.
         * @param {object} [vars={}] - A set of variables to replace in the email template.
         * @param {string} [locale='en-US'] - The desired locale of the user (e.g., 'ru-RU').
         * @param {string} [localeDef='en-US'] - The default locale of the application (e.g., 'en-US').
         * @param {string} [localePlugin='en-US'] - The default locale of the plugin (e.g., 'es-ES').
         * @returns {Promise<{resultCode: string, subject: string, text: string, html: string}>}
         * Resolves with an object containing the resultCode, subject, text, and html of the email template.
         */
        this.execute = async function (
            {
                pkg,
                templateName,
                vars = {},
                locale = 'en-US',
                localeDef = 'en-US',
                localePlugin = 'en-US',
            }
        ) {
            // VARS
            let resultCode = RESULT_CODES.UNKNOWN_ERROR;
            let subject, text, html;

            // MAIN
            try {
                const paths = aPathsComposer.act(pkg, templateName, locale, localeDef, localePlugin);

                // Load metadata
                const {dto: metaDto, foundPath: path} = await loadMeta(paths);
                if (metaDto) {
                    subject = metaDto.subject;

                    // Replace variables in subject
                    subject = replaceVariables(subject, vars);

                    // Load and replace variables in HTML template
                    if (await pathExists(path + '/body.html')) {
                        html = await readFile(path + '/body.html', 'utf8');
                        html = replaceVariables(html, vars);
                    } else {
                        logger.error(`HTML template not found at '${path}/body.html'.`);
                    }

                    // Load and replace variables in text template
                    if (await pathExists(path + '/body.txt')) {
                        text = await readFile(path + '/body.txt', 'utf8');
                        text = replaceVariables(text, vars);
                    } else {
                        logger.error(`TXT template not found at '${path}/body.txt'.`);
                    }

                    resultCode = RESULT_CODES.SUCCESS;
                    logger.info(`Template loaded successfully: '${templateName}' at '${path}'.`);
                } else {
                    logger.error(`Cannot find an email template for package "${pkg}", template "${templateName}", and locale "${locale}".`);
                }
            } catch (error) {
                logger.exception(error);
            }

            return {resultCode, subject, text, html};
        };

        /**
         * Returns the result codes enumeration.
         * @return {typeof TeqFw_Email_Back_Service_Load.RESULT_CODES}
         */
        this.getResultCodes = () => RESULT_CODES;
    }
}
