/*
* @Author: TnTap
* @Date:   2017-12-01 14:45:30
* @Last Modified by:   xandervr
* @Last Modified time: 2017-12-08 16:32:50
*/

const mongoose = require(`mongoose`);

/**
 * Schema definitions.
 */

const OAuthAccessTokensModel = mongoose.model(
    `OAuthAccessTokens`,
    mongoose.Schema({
        access_token: {type: String, index: true},
        expire_date: {type: Date},
        client: {type: mongoose.Schema.Types.ObjectId, ref: `OAuthClients`, index: true},
        ip: {type: String},
        refresh_token: {type: String},
        issue_date: {type: Date},
        device_name: String,
        device_os: String
    })
);
const OAuthTokensModel = mongoose.model(
    `OAuthTokens`,
    mongoose.Schema({
        token: {type: String, index: true},
        client: {type: mongoose.Schema.Types.ObjectId, ref: `OAuthClients`, index: true},
        nonce: {type: Number},
        issue_date: {type: Date}
    })
);
const OAuthClientsModel = mongoose.model(
    `OAuthClients`,
    mongoose.Schema({
        user: {type: mongoose.Schema.Types.ObjectId, ref: `User`, index: true},
        client_id: {type: String, index: true},
        client_secret: {type: String, index: true},
        comments: {type: String}
    })
);

/**
 * Get token.
 */

module.exports.getToken = (token, clientId, cb) => {
    OAuthClientsModel.findOne({client_id: clientId}, (err, client) => {
        OAuthTokensModel.findOne({token: token, client: client}, (err, res) => {
            cb(!err && res);
        });
    });
};

/**
 * Remove token
 */

module.exports.removeToken = (token, cb) => {
    OAuthTokensModel.remove({token: token}, (err, res) => {
        cb(!err && res);
    });
};

/**
 * Create client.
 */

module.exports.createClient = (user, client_secret, cb) => {
    OAuthClientsModel.create(
        {
            user: user,
            client_id: user.username,
            client_secret: client_secret
        },
        (err, client) => {
            cb(err, client);
        }
    );
};

/**
 * Get client.
 */

module.exports.getClient = (clientId, clientSecret, cb) => {
    OAuthClientsModel.findOne({client_id: clientId, client_secret: clientSecret}).exec((err, client) => {
        cb(!err && client);
    });
};

module.exports.getClientByUser = (user, cb) => {
    OAuthClientsModel.findOne({user}).exec((err, client) => {
        cb(err, client);
    });
};

/**
 * Get access token.
 */

module.exports.getAccessToken = (accessToken, cb) => {
    OAuthAccessTokensModel.findOne({access_token: accessToken, expire_date: {$gt: new Date()}}, (err, access_token) => {
        if (!err) cb(access_token);
        else cb(false);
    });
};

/**
 * Get user by access token.
 */

module.exports.getUserByAccessToken = (accessToken, cb) => {
    OAuthAccessTokensModel.findOne({access_token: accessToken, expire_date: {$gt: new Date()}})
        .populate({
            path: `client`,
            model: `OAuthClients`,
            populate: {
                path: `user`,
                model: `User`,
                select: `-password`,
                populate: {path: `license`, model: `License`}
            }
        })
        .exec((err, access_token) => {
            cb(err, access_token);
        });
};

/**
 * Get refresh token.
 */

module.exports.getRefreshToken = (refreshToken, cb) => {
    OAuthAccessTokensModel.findOne({refresh_token: refreshToken}, (err, refresh_token) => {
        cb(!err && refresh_token);
    });
};

/**
 * Save token.
 */

module.exports.saveToken = (token, clientId, nonce, cb) => {
    OAuthClientsModel.findOne({client_id: clientId}, (err, client) => {
        if (!err && client)
            OAuthTokensModel.create(
                {
                    token: token,
                    client: client,
                    nonce: nonce,
                    issue_date: new Date()
                },
                err => {
                    cb(!err);
                }
            );
        else cb(false);
    });
};

/**
 * Save access token.
 */

module.exports.saveAccessToken = (access_token, metadata, cb) => {
    OAuthClientsModel.findOne({client_id: access_token.client_id}, (err, client) => {
        if (!err && client)
            OAuthAccessTokensModel.findOne({access_token: access_token.token}, (err, token) => {
                if (!err)
                    if (!token)
                        OAuthAccessTokensModel.create(
                            {
                                access_token: access_token.token,
                                expire_date: access_token.expire_date,
                                refresh_token: access_token.refresh_token,
                                device_name: metadata ? metadata.device_name : null,
                                device_os: metadata ? metadata.device_os : null,
                                ip: metadata ? metadata.ip : null,
                                client: client
                            },
                            err => {
                                cb(!err);
                            }
                        );
                    else {
                        token.access_token = access_token.token;
                        token.expire_date = access_token.expire_date;
                        token.refresh_token = access_token.refresh_token;
                        token.save(err => {
                            cb(!err);
                        });
                    }
                else cb(false);
            });
        else cb(false);
    });
};
