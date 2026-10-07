// @ts-check

/**
 * @namespace TeqFw_Email_Back_Transport_Smtp
 * @description Bounded SMTP submission with implicit TLS or mandatory STARTTLS.
 */

export default class Smtp {
    /**
     * @param {object} deps
     * @param {TeqFw_Email_Config} deps.config
     * @param {typeof import('node:net').connect} deps.connect
     * @param {typeof import('node:tls').connect} deps.tlsConnect
     * @param {typeof import('node:net').isIP} deps.isIP
     */
    constructor({config, connect, tlsConnect, isIP}) {
        /**
         * @param {TeqFw_Email_WireMessage} message
         * @returns {Promise<void>}
         */
        this.send = async function (message) {
            const settings = config.get();
            /** @type {import('node:net').Socket | undefined} */
            let socket;
            /** @type {(() => void) | undefined} */
            let detach;
            /** @type {((error: Error) => void) | undefined} */
            let abort;
            let timedOut = false;
            let dataSubmitted = false;
            const timeout = setTimeout(function () {
                timedOut = true;
                abort?.(new Error('EMAIL_SMTP_TIMEOUT'));
                socket?.destroy(new Error('EMAIL_SMTP_TIMEOUT'));
            }, settings.timeoutMs);
            /**
             * @param {import('node:net').Socket} current
             * @returns A reply reader and command writer bound to the current socket.
             */
            const channel = function (current) {
                let buffer = '';
                /** @type {string[]} */
                let lines = [];
                /** @type {number | undefined} */
                let replyCode;
                /** @type {{code: number, lines: string[]}[]} */
                const replies = [];
                /** @type {{resolve: (reply: {code: number, lines: string[]}) => void, reject: (error: Error) => void} | undefined} */
                let pending;
                /** @type {Error | undefined} */
                let failed;
                /**
                 * @param {Error} error
                 * @returns {void}
                 */
                const fail = function (error) {
                    failed ??= error;
                    pending?.reject(failed);
                    pending = undefined;
                };
                abort = fail;
                /**
                 * @returns {void}
                 */
                const onError = function () { fail(new Error(timedOut ? 'EMAIL_SMTP_TIMEOUT' : 'EMAIL_SMTP_CONNECTION')); };
                /**
                 * @returns {void}
                 */
                const onClose = function () { fail(new Error('EMAIL_SMTP_CLOSED')); };
                /**
                 * @param {Buffer} chunk
                 * @returns {void}
                 */
                const onData = function (chunk) {
                    if (failed) return;
                    buffer += chunk.toString('ascii');
                    if (buffer.length > 65536) { fail(new Error('EMAIL_SMTP_REPLY_TOO_LARGE')); return; }
                    let index;
                    while ((index = buffer.indexOf('\r\n')) !== -1) {
                        const line = buffer.slice(0, index);
                        buffer = buffer.slice(index + 2);
                        const match = /^([2-5]\d{2})([ -])(.*)$/.exec(line);
                        if (!match || line.length > 510 || (replyCode !== undefined && replyCode !== Number(match[1]))) {
                            fail(new Error('EMAIL_SMTP_INVALID_REPLY')); return;
                        }
                        replyCode = Number(match[1]);
                        lines.push(match[3]);
                        if (lines.length > 100) { fail(new Error('EMAIL_SMTP_REPLY_TOO_LARGE')); return; }
                        if (match[2] === ' ') {
                            const reply = {code: replyCode, lines};
                            replyCode = undefined;
                            lines = [];
                            if (pending) {
                                pending.resolve(reply);
                                pending = undefined;
                            } else {
                                replies.push(reply);
                                if (replies.length > 10) { fail(new Error('EMAIL_SMTP_UNEXPECTED_REPLY')); return; }
                            }
                        }
                    }
                };
                current.on('data', onData);
                current.on('error', onError);
                current.on('close', onClose);
                detach = function () {
                    current.off('data', onData);
                    current.off('error', onError);
                    current.off('close', onClose);
                };
                /**
                 * @returns {Promise<TeqFw_Email_Reply>}
                 */
                const read = function () {
                    if (failed) return Promise.reject(failed);
                    const queued = replies.shift();
                    if (queued) return Promise.resolve(queued);
                    return new Promise(function (resolve, reject) { pending = {resolve, reject}; });
                };
                return {
                    read,
                    /**
                     * @param {string} line
                     * @param {number[]} codes
                     * @returns {Promise<TeqFw_Email_Reply>}
                     */
                    command: async function (line, codes) {
                        if (failed) throw failed;
                        current.write(line + '\r\n');
                        const reply = await read();
                        if (!codes.includes(reply.code)) throw new Error(`EMAIL_SMTP_REJECTED_${reply.code}`);
                        return reply;
                    },
                };
            };
            /**
             * @param {import('node:net').Socket} current
             * @param {string} event
             * @returns {Promise<void>}
             */
            const ready = function (current, event) {
                return new Promise(function (resolve, reject) {
                    /** @returns {void} */
                    const clean = function () { current.off(event, done); current.off('error', error); current.off('close', closed); };
                    /** @returns {void} */
                    const done = function () { clean(); resolve(); };
                    /** @returns {void} */
                    const error = function () { clean(); reject(new Error(timedOut ? 'EMAIL_SMTP_TIMEOUT' : 'EMAIL_SMTP_CONNECTION')); };
                    /** @returns {void} */
                    const closed = function () { clean(); reject(new Error('EMAIL_SMTP_CLOSED')); };
                    current.once(event, done);
                    current.once('error', error);
                    current.once('close', closed);
                });
            };
            try {
                const tlsOptions = {host: settings.host, port: settings.port,
                    servername: isIP(settings.host) ? undefined : settings.host, rejectUnauthorized: true, minVersion: /** @type {const} */ ('TLSv1.2')};
                socket = settings.secure ? tlsConnect(tlsOptions) : connect({host: settings.host, port: settings.port});
                let stream = channel(socket);
                await ready(socket, settings.secure ? 'secureConnect' : 'connect');
                if ((await stream.read()).code !== 220) throw new Error('EMAIL_SMTP_INVALID_GREETING');
                let ehlo = await stream.command(`EHLO ${settings.clientName}`, [250]);
                if (!settings.secure) {
                    if (!ehlo.lines.some((line) => /^STARTTLS(?:\s|$)/i.test(line))) throw new Error('EMAIL_SMTP_STARTTLS_REQUIRED');
                    await stream.command('STARTTLS', [220]);
                    detach?.();
                    socket = tlsConnect({...tlsOptions, socket});
                    stream = channel(socket);
                    await ready(socket, 'secureConnect');
                    ehlo = await stream.command(`EHLO ${settings.clientName}`, [250]);
                }
                if (settings.auth) {
                    const auth = ehlo.lines.find((line) => /^AUTH(?:\s|=)/i.test(line)) ?? '';
                    const methods = auth.replace(/^AUTH[ =]/i, '').toUpperCase().split(/\s+/);
                    if (methods.includes('PLAIN')) {
                        const token = Buffer.from(`\0${settings.auth.user}\0${settings.auth.pass}`).toString('base64');
                        const reply = await stream.command(`AUTH PLAIN ${token}`, [235, 334]);
                        if (reply.code === 334) await stream.command(token, [235]);
                    } else if (methods.includes('LOGIN')) {
                        await stream.command('AUTH LOGIN', [334]);
                        await stream.command(Buffer.from(settings.auth.user).toString('base64'), [334]);
                        await stream.command(Buffer.from(settings.auth.pass).toString('base64'), [235]);
                    } else throw new Error('EMAIL_SMTP_AUTH_UNSUPPORTED');
                }
                await stream.command(`MAIL FROM:<${message.from}>`, [250]);
                for (const recipient of message.to) await stream.command(`RCPT TO:<${recipient}>`, [250, 251, 252]);
                await stream.command('DATA', [354]);
                const data = message.data.replace(/\r\n|\r|\n/g, '\r\n').replace(/^\./gm, '..');
                socket.write(data + (data.endsWith('\r\n') ? '' : '\r\n') + '.\r\n');
                dataSubmitted = true;
                const result = await stream.read();
                if (result.code !== 250) throw new Error(`EMAIL_SMTP_REJECTED_${result.code}`);
                dataSubmitted = false;
                // Acceptance is final; a QUIT or disconnect problem must not invite duplicate submission.
                try { await stream.command('QUIT', [221]); } catch { /* Submission was accepted. */ }
            } catch (error) {
                if (dataSubmitted && !(error instanceof Error && /^EMAIL_SMTP_REJECTED_/.test(error.message))) {
                    throw new Error('EMAIL_SMTP_OUTCOME_UNKNOWN');
                }
                throw error;
            } finally {
                clearTimeout(timeout);
                socket?.destroy();
                detach?.();
            }
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
        config: 'TeqFw_Email_Config$',
        connect: 'node:net__connect',
        tlsConnect: 'node:tls__connect',
        isIP: 'node:net__isIP',
    }),
});
