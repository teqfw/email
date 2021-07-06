/**
 * Plugin level constants (hardcoded configuration).
 */
class TeqFw_Email_Defaults {

    BACK_REALM = 'email';  // realm for API services ('/api/email/...') and CLI commands ('email-...')

    // DI container labels for objects used by this plugin
    DI_OBJ = 'pluginObject';

    // DEF-objects of the dependencies.
    /** @type {TeqFw_Core_Back_Defaults} */
    MOD_CORE;

    // SERVICES ROUTES


    constructor(spec) {
        // this.MOD_CORE = spec['TeqFw_Core_Back_Defaults$']; // singleton
        Object.freeze(this);
    }
}

// MODULE'S EXPORT
export default TeqFw_Email_Defaults;
