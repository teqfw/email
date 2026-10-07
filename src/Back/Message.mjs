// @ts-check

/**
 * @namespace TeqFw_Email_Back_Message
 * @description Builds UTF-8 MIME messages and validates SMTP envelope addresses.
 */

export default class Message {
    /**
     * @param {object} deps
     * @param {typeof import('node:crypto').randomUUID} deps.randomUUID
     */
    constructor({randomUUID}) {
        /**
         * @param {string} input
         * @returns {TeqFw_Email_Mailbox}
         */
        const mailbox = function (input) {
            if (typeof input !== 'string' || /[\r\n\0]/.test(input)) throw new Error('EMAIL_INVALID_ADDRESS');
            const value = input.trim();
            const match = /^(.*?)\s*<([^<>]+)>$/.exec(value);
            const address = match ? match[2] : value;
            // This deliberately bounded grammar excludes quoted local parts and SMTPUTF8.
            const parts = address.split('@');
            if (parts.length !== 2 || parts[0].length > 64 || address.length > 254 ||
                !/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/.test(parts[0]) ||
                parts[0].startsWith('.') || parts[0].endsWith('.') || parts[0].includes('..') ||
                !/^[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?$/.test(parts[1]) ||
                parts[1].split('.').some((label) => label.length > 63 || !/^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(label))) {
                throw new Error('EMAIL_INVALID_ADDRESS');
            }
            const name = match?.[1].trim();
            return {address, header: name ? `${encode(name)} <${address}>` : address};
        };
        /**
         * @param {string} value
         * @returns {string}
         */
        const encode = function (value) {
            if (typeof value !== 'string' || /[\r\n\0]/.test(value)) throw new Error('EMAIL_INVALID_HEADER');
            if (value === '') return '';
            // Encoded words are folded and kept under the RFC 2047 size limit.
            const chunks = [];
            let chunk = '';
            for (const char of value) {
                if (Buffer.byteLength(chunk + char) > 42) {
                    chunks.push(chunk);
                    chunk = '';
                }
                chunk += char;
            }
            if (chunk || !chunks.length) chunks.push(chunk);
            return chunks.map((part) => `=?UTF-8?B?${Buffer.from(part).toString('base64')}?=`).join('\r\n ');
        };
        /**
         * @param {string} body
         * @param {string} subtype
         * @returns {string}
         */
        const part = function (body, subtype) {
            const base64 = Buffer.from(body.replace(/\r\n|\r|\n/g, '\r\n')).toString('base64');
            return `Content-Type: text/${subtype}; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n` +
                (base64.match(/.{1,76}/g) ?? ['']).join('\r\n');
        };
        /**
         * @param {TeqFw_Email_PreparedInput} input
         * @returns {TeqFw_Email_WireMessage}
         */
        this.build = function (input) {
            const {from, to, subject, text, html, headers = {}} = input;
            const sender = mailbox(from);
            const recipients = (Array.isArray(to) ? to : [to]).map(mailbox);
            if (!recipients.length || recipients.length > 100) throw new Error('EMAIL_INVALID_RECIPIENT_COUNT');
            if (typeof subject !== 'string' ||
                (text !== undefined && typeof text !== 'string') ||
                (html !== undefined && typeof html !== 'string') ||
                (text === undefined && html === undefined)) throw new Error('EMAIL_INVALID_CONTENT');
            const messageId = `<${randomUUID()}@${sender.address.split('@')[1]}>`;
            const lines = [
                `From: ${sender.header}`,
                `To: ${recipients.map((item) => item.header).join(',\r\n ')}`,
                `Subject: ${encode(subject)}`,
                `Date: ${new Date().toUTCString()}`,
                `Message-ID: ${messageId}`,
                'MIME-Version: 1.0',
            ];
            for (const [name, value] of Object.entries(headers)) {
                if (!/^[A-Za-z0-9-]+$/.test(name) ||
                    /^(from|to|cc|bcc|subject|date|message-id|mime-version|content-.+|return-path|received)$/i.test(name) ||
                    typeof value !== 'string' || /[^\x20-\x7e]/.test(value) || name.length + value.length > 990) {
                    throw new Error('EMAIL_INVALID_HEADER');
                }
                lines.push(`${name}: ${value}`);
            }
            let body;
            if (text !== undefined && html !== undefined) {
                const boundary = `teqfw-${randomUUID()}`;
                lines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
                body = `\r\n--${boundary}\r\n${part(text, 'plain')}\r\n--${boundary}\r\n${part(html, 'html')}\r\n--${boundary}--\r\n`;
            } else {
                body = part(text ?? html ?? '', text !== undefined ? 'plain' : 'html') + '\r\n';
            }
            const data = lines.join('\r\n') + '\r\n' + body;
            return {from: sender.address, to: recipients.map((item) => item.address), messageId, data};
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({randomUUID: 'node:crypto__randomUUID'}),
});
