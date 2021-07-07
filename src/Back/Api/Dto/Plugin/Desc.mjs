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
    constructor(spec) {
        // EXTRACT DEPS
        /** @type {typeof TeqFw_Email_Back_Api_Dto_Plugin_Desc_Auth} */
        const DAuth = spec['TeqFw_Email_Back_Api_Dto_Plugin_Desc_Auth#'];
        /** @type {TeqFw_Email_Back_Api_Dto_Plugin_Desc_Auth.Factory} */
        const fAuth = spec['TeqFw_Email_Back_Api_Dto_Plugin_Desc_Auth#Factory$'];

        /**
         * @param {TeqFw_Email_Back_Api_Dto_Plugin_Desc|null|Object} data
         * @return {TeqFw_Email_Back_Api_Dto_Plugin_Desc}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Email_Back_Api_Dto_Plugin_Desc();
            res.auth = (data?.auth instanceof DAuth) ? data.auth : fAuth.create(data?.auth);
            res.from = data?.from;
            res.host = data?.host;
            res.port = data?.port;
            res.secure = data?.secure;
            return res;
        }
    }
}

// freeze DTO class to deny attributes changes and pin namespace
Object.freeze(TeqFw_Email_Back_Api_Dto_Plugin_Desc);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});
