/**
 * DTO to represent plugin descriptor (teqfw.json) structure
 * that is related to 'email/auth' node:
 */
// MODULE'S VARS
const NS = 'TeqFw_Email_Back_Api_Dto_Plugin_Desc_Auth';

// MODULE'S CLASSES
export default class TeqFw_Email_Back_Api_Dto_Plugin_Desc_Auth {
    /** @type {string} */
    pass;
    /** @type {string} */
    user;
}

// attributes names to use as aliases in queries to object props
TeqFw_Email_Back_Api_Dto_Plugin_Desc_Auth.PASS = 'pass';
TeqFw_Email_Back_Api_Dto_Plugin_Desc_Auth.USER = 'user';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Email_Back_Api_Dto_Plugin_Desc_Auth
 */
export class Factory {
    static namespace = NS;

    constructor(spec) {
        const {castString} = spec['TeqFw_Core_Shared_Util_Cast'];
        /**
         * @param {TeqFw_Email_Back_Api_Dto_Plugin_Desc_Auth|null} data
         * @return {TeqFw_Email_Back_Api_Dto_Plugin_Desc_Auth}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Email_Back_Api_Dto_Plugin_Desc_Auth();
            res.pass = castString(data?.pass);
            res.user = castString(data?.user);
            return res;
        }
    }
}

// freeze DTO class to deny attributes changes and pin namespace
Object.freeze(TeqFw_Email_Back_Api_Dto_Plugin_Desc_Auth);
