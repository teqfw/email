/**
 * The authentication part of the local configuration DTO.
 * @see TeqFw_Core_Back_Config
 */
// MODULE'S VARS
const NS = 'TeqFw_Email_Back_Plugin_Dto_Config_Local_Auth';

// MODULE'S CLASSES
/**
 * @memberOf TeqFw_Email_Back_Plugin_Dto_Config_Local_Auth
 */
class Dto {
    static namespace = NS;
    /** @type {string} */
    pass;
    /** @type {string} */
    user;
}

/**
 * @implements TeqFw_Core_Shared_Api_Factory_Dto
 */
export default class TeqFw_Email_Back_Plugin_Dto_Config_Local_Auth {
    /**
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
        }
    ) {

        /**
         * @param {TeqFw_Email_Back_Plugin_Dto_Config_Local_Auth.Dto} data
         * @return {TeqFw_Email_Back_Plugin_Dto_Config_Local_Auth.Dto}
         */
        this.createDto = function (data) {
            // create new DTO and populate it with initialization data
            const res = Object.assign(new Dto(), data);
            // cast known attributes
            res.pass = cast.string(data?.pass);
            res.user = cast.string(data?.user);
            return res;
        };
    }
}