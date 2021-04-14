/**
 * Configuration for the plugin.
 */
class TeqFw_Email_Api_Config_Auth {
    /** @type {String} */
    user;
    /** @type {String} */
    pass;
}

class TeqFw_Email_Api_Config {
    /** @type {TeqFw_Email_Api_Config_Auth} */
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
    TeqFw_Email_Api_Config as default,
    TeqFw_Email_Api_Config_Auth as Auth
};
