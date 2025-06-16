import CryptoJs from "crypto-js";

const SALT = 'SALT1234';
const SECRET_KEY = CryptoJs.SHA256('internsNeverGuess');

export function decryptField (encryptedData, ivBase64) {
    try {
        const iv = CryptoJs.enc.Base64.parse(ivBase64);
        const decrypted = CryptoJs.AES.decrypt(
            {ciphertext: CryptoJs.enc.Base64.parse(encryptedData)},
            SECRET_KEY,
            {iv: iv, mode: CryptoJs.mode.CBC, padding: CryptoJs.pad.Pkcs7 }
        );

        const plainText = decrypted.toString(CryptoJs.enc.Utf8);
        if (!plainText.startswith(SALT)){
            return null;
        }

        const stripped = plainText.replace(SALT, '');
        const [label, type] = stripped.split(':');

        if (!label || !type){
            return null;
        }
    } catch (error) {
        return null;
    }
}