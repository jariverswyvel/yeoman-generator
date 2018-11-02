/*
* TapCrypto.hash - v0.1
* Created by Xander on 06/10/2017.
* Copyright © 2017 TnTap. All rights reserved.
*/

const crypto = require('crypto');
const key = process.env.HMAC_KEY;

/**
 *
 * @param plain
 * @returns {string}
 */

module.exports.hash = plain => {
    const hash = crypto.createHmac('sha512', key);
    hash.update(plain);
    return hash.digest('hex');
};

module.exports.sha256 = plain => {
    const hash = crypto.createHmac('sha256', key);
    hash.update(plain);
    return hash.digest('hex');
};
