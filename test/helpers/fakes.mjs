export const logger = {
    forSource() { return {trace() {}, debug() {}, info() {}, warn() {}, error() {}}; },
};

export const settings = {
    host: 'localhost', port: 587, secure: false, from: 'sender@example.test',
    silentMode: false, timeoutMs: 500, clientName: 'localhost',
    auth: {user: 'user', pass: 'password'},
};

export function captureLogs() {
    const records = [];
    const provider = {forSource(source) {
        return Object.fromEntries(['trace', 'debug', 'info', 'warn', 'error'].map((level) =>
            [level, (message, data) => records.push({source, level, message, data})]));
    }};
    return {records, provider};
}
