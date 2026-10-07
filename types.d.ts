import type {} from '@teqfw/cfg';
import type {} from '@teqfw/log';

declare global {
    type TeqFw_Email_Back_Act_Send = import("./src/Back/Act/Send.mjs").default;
    type TeqFw_Email_Back_Act_Send__Class = typeof import("./src/Back/Act/Send.mjs").default;
    type TeqFw_Email_Back_Message = import("./src/Back/Message.mjs").default;
    type TeqFw_Email_Back_Message__Class = typeof import("./src/Back/Message.mjs").default;
    type TeqFw_Email_Back_Service_Load = import("./src/Back/Service/Load.mjs").default;
    type TeqFw_Email_Back_Service_Load_A_PathsComposer = import("./src/Back/Service/Load/A/PathsComposer.mjs").default;
    type TeqFw_Email_Back_Service_Load_A_PathsComposer__Class = typeof import("./src/Back/Service/Load/A/PathsComposer.mjs").default;
    type TeqFw_Email_Back_Service_Load__Class = typeof import("./src/Back/Service/Load.mjs").default;
    type TeqFw_Email_Back_Service_Send = import("./src/Back/Service/Send.mjs").default;
    type TeqFw_Email_Back_Service_Send__Class = typeof import("./src/Back/Service/Send.mjs").default;
    type TeqFw_Email_Back_Transport_Smtp = import("./src/Back/Transport/Smtp.mjs").default;
    type TeqFw_Email_Back_Transport_Smtp__Class = typeof import("./src/Back/Transport/Smtp.mjs").default;
    type TeqFw_Email_Config = import("./src/Config.mjs").default;
    type TeqFw_Email_Config__Class = typeof import("./src/Config.mjs").default;
    type TeqFw_Email_Headers = {[key: string]: string};
    type TeqFw_Email_Mailbox = {address: string; header: string};
    type TeqFw_Email_MessageInput = {
        from?: string; to: string | string[]; subject: string; text?: string; html?: string;
        headers?: TeqFw_Email_Headers;
    };
    type TeqFw_Email_PreparedInput = TeqFw_Email_MessageInput & {from: string};
    type TeqFw_Email_Reply = {code: number; lines: string[]};
    type TeqFw_Email_ResultCodes = {SUCCESS: string; UNKNOWN_ERROR: string};
    type TeqFw_Email_SendResult = {success: boolean; messageId?: string; error?: string; simulated?: boolean};
    type TeqFw_Email_Settings = {
        host: string; port: number; secure: boolean; from: string; silentMode: boolean;
        timeoutMs: number; clientName: string; auth?: {user: string; pass: string};
    };
    type TeqFw_Email_TemplateInput = {
        root: string; pkg: string; templateName: string; vars?: TeqFw_Email_TemplateVars;
        locale?: string; localeDef?: string; localePlugin?: string;
    };
    type TeqFw_Email_TemplateResult = {resultCode: string; subject?: string; text?: string; html?: string};
    type TeqFw_Email_TemplateSendInput = TeqFw_Email_TemplateInput & {to: string | string[]; from?: string; headers?: TeqFw_Email_Headers};
    type TeqFw_Email_TemplateSendResult = {resultCode: string; messageId?: string; simulated?: boolean};
    type TeqFw_Email_TemplateVars = {[key: string]: string | number | boolean};
    type TeqFw_Email_WireMessage = {from: string; to: string[]; messageId: string; data: string};
}

export {};
