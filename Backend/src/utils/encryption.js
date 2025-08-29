const crypto = require('crypto');

const ek=process.env.AES_ENCRYPTION_KEY||'0123456789abcdef0123456789abcdef';
const iv=process.env.AES_IV||'abcdef9876543210';

const ENCRYPTION_KEY = Buffer.from(ek, 'utf8'); // 32 bytes
const IV = Buffer.from(iv, 'utf8'); // 16 bytes

function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted
}

function decrypt(encryptedData) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = { encrypt, decrypt };