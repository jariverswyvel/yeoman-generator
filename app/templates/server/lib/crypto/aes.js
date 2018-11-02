/*
* TapCrypto.AES - v0.1
* Created by Xander on 06/10/2017.
* Copyright © 2017 TnTap. All rights reserved.
*/

const aes = require('node-cryptojs-aes');
const crypto = aes.CryptoJS;
const jsonFormatter = aes.JsonFormatter;

/**
 *
 * @param data
 * @param key
 * @returns {string} - in format ct:iv:s
 * @constructor
 */

module.exports.AESEncrypt = (data, key) => {
    const encrypted_data = crypto.AES.encrypt(data, key, {format: jsonFormatter});
    const jsonData = encrypted_data.toString();
    const obj = JSON.parse(jsonData);
    return obj.ct + ':' + obj.iv + ':' + obj.s;
};

/**
 *
 * @param data - Should be in format ct:iv:s
 * @param key
 * @returns {string}
 * @constructor
 */

module.exports.AESDecrypt = (data, key) => {
    const dataArray = data.split(':');
    const obj = {
        ct: dataArray[0],
        iv: dataArray[1],
        s: dataArray[2]
    };
    const jsonData = JSON.stringify(obj);
    const decrypted_data = crypto.AES.decrypt(jsonData, key, {format: jsonFormatter});
    return crypto.enc.Utf8.stringify(decrypted_data);
};
