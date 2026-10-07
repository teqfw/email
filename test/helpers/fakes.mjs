export const logger = {
    forSource() { return {info() {}, error() {}}; },
};

export const settings = {
    host: 'localhost', port: 587, secure: false, from: 'sender@example.test',
    silentMode: false, timeoutMs: 500, clientName: 'localhost',
    auth: {user: 'user', pass: 'password'},
};
