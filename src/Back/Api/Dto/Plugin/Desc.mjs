/**
 * DTO to represent plugin descriptor (teqfw.json) structure
 * that is related to 'email' node:
 */
// MODULE'S VARS
const NS = 'TeqFw_Email_Back_Api_Dto_Plugin_Desc';

// MODULE'S CLASSES
export default class TeqFw_Email_Back_Api_Dto_Plugin_Desc {
    /** @type {TeqFw_Email_Back_Api_Dto_Plugin_Desc_Auth} */
    auth;
    /** @type {string} 'Sender Name <sender@mail.com>' */
    from;
    /** @type {string} */
    host;
    /** @type {number} */
    port;
    /** @type {boolean} */
    secure;
}

// attributes names to use as aliases in queries to object props
TeqFw_Email_Back_Api_Dto_Plugin_Desc.FROM = 'from';
TeqFw_Email_Back_Api_Dto_Plugin_Desc.HOST = 'host';
TeqFw_Email_Back_Api_Dto_Plugin_Desc.PORT = 'port';
TeqFw_Email_Back_Api_Dto_Plugin_Desc.SECURE = 'secure';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Email_Back_Api_Dto_Plugin_Desc
 */
export class Factory {
    static namespace = NS;

    constructor(spec) {
        const {castBoolean, castInt, castString} = spec['TeqFw_Core_Shared_Util_Cast'];
        /** @type {TeqFw_Email_Back_Api_Dto_Plugin_Desc_Auth.Factory} */
        const fAuth = spec['TeqFw_Email_Back_Api_Dto_Plugin_Desc_Auth#Factory$'];

        /**
         * @param {TeqFw_Email_Back_Api_Dto_Plugin_Desc|null|Object} data
         * @return {TeqFw_Email_Back_Api_Dto_Plugin_Desc}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Email_Back_Api_Dto_Plugin_Desc();
            res.auth = fAuth.create(data?.auth);
            res.from = castString(data?.from);
            res.host = castString(data?.host);
            res.port = castInt(data?.port);
            res.secure = castBoolean(data?.secure);
            return res;
        }
    }
}

// freeze DTO class to deny attributes changes and pin namespace
Object.freeze(TeqFw_Email_Back_Api_Dto_Plugin_Desc);
