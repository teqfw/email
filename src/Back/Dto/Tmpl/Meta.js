/**
 * Data structure for email template metadata in the business logic layer (Domain DTO).
 * @namespace TeqFw_Email_Back_Dto_Tmpl_Meta
 */

// MODULE'S CLASSES
/**
 * @memberOf TeqFw_Email_Back_Dto_Tmpl_Meta
 */
class Dto {
    /**
     * Description of the email template.
     * @type {string}
     */
    description;
    /**
     * Language code for the email template.
     * @type {string}
     */
    language;
    /**
     * Email subject line.
     * @type {string}
     */
    subject;
    /**
     * List of variables used in the email template.
     * @type {Array<string>}
     */
    variables;
}

/**
 * @implements TeqFw_Core_Shared_Api_Factory_Dto
 */
export default class TeqFw_Email_Back_Dto_Tmpl_Meta {
    /**
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
        }
    ) {
        // INSTANCE METHODS
        /**
         * Creates a new DTO and populates it with initialization data.
         * @param {TeqFw_Email_Back_Dto_Tmpl_Meta.Dto} [data]
         * @returns {TeqFw_Email_Back_Dto_Tmpl_Meta.Dto}
         */
        this.createDto = function (data) {
            // Create a new DTO and populate it with initial data
            const res = Object.assign(new Dto(), data);

            // Cast known attributes in alphabetical order
            res.description = cast.string(data?.description);
            res.language = cast.string(data?.language);
            res.subject = cast.string(data?.subject);
            res.variables = cast.arrayOfStr(data?.variables);

            return res;
        };
    }
}
