const errorPattern = /\((.+)\)/;
const errorMap = new Map([
    ['auth/invalid-credential', 'Invalid credentials'],
    ['auth/email-already-in-use', 'Email already registered'],
    ['auth/weak-password', 'Password should be at least 6 characters'],
    ['auth/network-request-failed', 'Network request failed'],
    ['auth/too-many-requests', 'Too many requests'],
    ['auth/timeout', 'Request timed out'],
]);

export function mapError(errorMessage) {
    let match = errorMessage.match(errorPattern);
    if (match && errorMap.has(match[1])) {
        return errorMap.get(match[1])
    } else {
        return 'Error with server.';
    }
}