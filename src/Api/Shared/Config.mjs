/**
 * Configuration for the plugin (email).
 * @see TeqFw_Core_Back_Config
 *
 * @namespace TeqFw_Email_Api_Shared_Config
 */
// MODULE'S VARS
const NS = 'TeqFw_Email_Api_Shared_Config';

/**
 * @memberOf TeqFw_Email_Api_Shared_Config
 */
class Auth {
    /** @type {String} */
    user;
    /** @type {String} */
    pass;
}
Object.defineProperty(Auth, 'name', {value: `${NS}.${Auth.name}`});


class TeqFw_Email_Api_Shared_Config {
    /** @type {Auth} */
    auth;
    /** @type {String} 'Sender Name <sender@mail.com>' */
    from;
    /** @type {String} */
    host;
    /** @type {Number} */
    port;
    /** @type {Boolean} */
    secure;
}

export {
    TeqFw_Email_Api_Shared_Config as default,
    Auth
};
