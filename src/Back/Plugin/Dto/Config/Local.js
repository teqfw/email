/**
 * Local configuration DTO for the plugin.
 * @see TeqFw_Core_Back_Config
 *
 * @implements TeqFw_Core_Shared_Api_Factory_Dto
 */
export default class TeqFw_Email_Back_Plugin_Dto_Config_Local {
    /**
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     * @param {TeqFw_Email_Back_Plugin_Dto_Config_Local_Auth} dtoAuth
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
            TeqFw_Email_Back_Plugin_Dto_Config_Local_Auth$: dtoAuth,
        }
    ) {
        /**
         * @param {TeqFw_Email_Back_Plugin_Dto_Config_Local.Dto} data
         * @return {TeqFw_Email_Back_Plugin_Dto_Config_Local.Dto}
         */
        this.createDto = function (data) {
            // create a new DTO and populate it with initialization data
            const res = Object.assign(new Dto(), data);
            // cast known attributes
            res.auth = dtoAuth.createDto(data?.auth);
            res.from = cast.string(data?.from);
            res.host = cast.string(data?.host);
            res.port = cast.int(data?.port);
            res.secure = cast.boolean(data?.secure);
            res.silentMode = cast.boolean(data?.silentMode);
            return res;
        };
    }
}

/**
 * @memberOf TeqFw_Email_Back_Plugin_Dto_Config_Local
 */
class Dto {
    /** @type {TeqFw_Email_Back_Plugin_Dto_Config_Local_Auth.Dto} */
    auth;
    /** @type {string} 'Sender Name <sender@mail.com>' */
    from;
    /** @type {string} */
    host;
    /** @type {number} */
    port;
    /** @type {boolean} */
    secure;
    /**
     * Prevents actual email sending during development.
     * TODO: use `streamTransport` from `nodemail` to save emails to a file.
     * @type {boolean}
     */
    silentMode;
}