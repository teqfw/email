import net from 'node:net';
import tls from 'node:tls';
import fs from 'node:fs/promises';
import {once} from 'node:events';

// Generated test-only identity, unrelated to any production certificate or credential.
export const cert = await fs.readFile(new URL('../fixtures/smtp-cert.pem', import.meta.url));
const key = await fs.readFile(new URL('../fixtures/smtp-key.pem', import.meta.url));

export async function smtpServer({implicit = false, rejectRecipient = false, advertiseStarttls = true, login = false, failAuth = false} = {}) {
    const commands = [];
    const messages = [];
    const connections = new Set();
    const secureContext = tls.createSecureContext({key, cert});
    function attach(socket, secure, greeting = true) {
        connections.add(socket);
        socket.on('error', () => {});
        socket.on('close', () => connections.delete(socket));
        if (greeting) socket.write('220 localhost test submission\r\n');
        let buffer = '';
        let body = false;
        let loginStep = 0;
        const data = (chunk) => {
            buffer += chunk.toString();
            let index;
            while ((index = buffer.indexOf('\r\n')) !== -1) {
                const line = buffer.slice(0, index);
                buffer = buffer.slice(index + 2);
                if (body) {
                    if (line === '.') {body = false; socket.write('250 queued as fixture\r\n');}
                    else messages.at(-1).push(line.replace(/^\.\./, '.'));
                    continue;
                }
                commands.push({line, secure});
                if (loginStep) {
                    const value = Buffer.from(line, 'base64').toString();
                    if (loginStep === 1) {loginStep = 2; assertAuth(value === 'user', socket, '334 UGFzc3dvcmQ=\r\n');}
                    else {loginStep = 0; assertAuth(value === 'password' && !failAuth, socket, '235 authorized\r\n');}
                } else if (line.startsWith('EHLO ')) {
                    socket.write(`250-localhost\r\n${!secure && advertiseStarttls ? '250-STARTTLS\r\n' : ''}250 AUTH ${login ? 'LOGIN' : 'PLAIN'}\r\n`);
                } else if (line === 'STARTTLS') {
                    socket.write('220 Ready for TLS\r\n', () => {
                        socket.off('data', data);
                        const encrypted = new tls.TLSSocket(socket, {isServer: true, secureContext});
                        encrypted.on('error', () => {});
                        attach(encrypted, true, false);
                    });
                    return;
                } else if (line === 'AUTH LOGIN') {
                    if (!secure) {socket.write('538 encryption required\r\n'); continue;}
                    loginStep = 1; socket.write('334 VXNlcm5hbWU=\r\n');
                } else if (line.startsWith('AUTH PLAIN ')) {
                    const value = Buffer.from(line.slice(11), 'base64').toString();
                    assertAuth(secure && value === '\0user\0password' && !failAuth, socket, '235 authorized\r\n');
                } else if (line.startsWith('MAIL FROM:')) socket.write('250 sender accepted\r\n');
                else if (line.startsWith('RCPT TO:')) socket.write(rejectRecipient ? '550 recipient denied\r\n' : '250 recipient accepted\r\n');
                else if (line === 'DATA') {body = true; messages.push([]); socket.write('354 send content\r\n');}
                else if (line === 'QUIT') socket.end('221 bye\r\n');
                else socket.write('500 unknown command\r\n');
            }
        };
        socket.on('data', data);
    }
    function assertAuth(valid, socket, response) {socket.write(valid ? response : '535 authentication failed\r\n');}
    const server = implicit ? tls.createServer({key, cert}, (socket) => attach(socket, true)) : net.createServer((socket) => attach(socket, false));
    server.on('tlsClientError', () => {});
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    return {port: server.address().port, commands, messages, async close() {
        for (const socket of connections) socket.destroy();
        server.close(); await once(server, 'close');
    }};
}
