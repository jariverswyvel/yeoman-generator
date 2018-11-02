/*
* @Author: TnTap
* @Date:   2017-12-01 13:33:32
* @Last Modified by:   xandervr
* @Last Modified time: 2017-12-08 16:37:54
*/

const crypto = require(`crypto`);

class TapAuth {
    constructor(model, options) {
        this.model = model;
        this.options = options;
        if (!this.options) this.options = {expire_time: 1000 * 60 * 60 * 24 * 31};
    }

    __hash512(plain) {
        const hash = crypto.createHmac(`sha512`, process.env.HMAC_KEY);
        hash.update(plain);
        return hash.digest(`hex`);
    }

    __hash256(plain) {
        const hash = crypto.createHmac(`sha256`, process.env.HMAC_KEY);
        hash.update(plain);
        return hash.digest(`hex`);
    }

    generateClientData(user, cb) {
        this.model.createClient(user, this.__hash256(`${user.username}${user.password}${user.ip_registered}`), (err, data) => {
            cb(err, data);
        });
    }

    getClientData(user, cb) {
        this.model.getClientByUser(user, (err, data) => cb(err, data));
    }

    getUserFromAccessToken(access_token, cb) {
        this.model.getUserByAccessToken(access_token.replace(`Bearer `, ``), (err, token) => {
            if (!err && token) cb(null, token.client.user);
            else cb(err, null);
        });
    }

    token() {
        return (req, res) => {
            this.model.getClient(req.body.client_id, req.body.client_secret, success => {
                if (success)
                    this.__generateToken(req.body.client_id, (err, token) => {
                        handleResponse(req, res, 200, {
                            code: token,
                            issue_date: Date.now()
                        });
                    });
                else handleResponse(req, res, 403, generateError(`Token`));
            });
        };
    }

    authenticate() {
        return (req, res) => {
            this.model.getToken(req.body.code, req.body.client_id, success => {
                if (success)
                    this.model.getClient(req.body.client_id, req.body.client_secret, success => {
                        if (success)
                            this.__generateAccessToken(
                                req.body.code,
                                req.body.client_id,
                                req.body.client_secret,
                                {
                                    device_name: req.body.device_name,
                                    device_os: req.body.device_os,
                                    ip: req.headers[`x-real-ip`] || req.connection.remoteAddress
                                },
                                (err, access_token) => {
                                    if (!err)
                                        handleResponse(req, res, 200, {
                                            access_token: access_token.token,
                                            expire_date: access_token.expire_date,
                                            refresh_token: access_token.refresh_token,
                                            issue_date: Date.now()
                                        });
                                    else handleResponse(req, res, 403, err);
                                }
                            );
                        else handleResponse(req, res, 403, generateError(`Token`));
                    });
                else handleResponse(req, res, 403, generateError(`Authenticate`));
            });
        };
    }

    validate() {
        return (req, res) => {
            this.model.getUserByAccessToken(req.headers.authorization.replace(`Bearer `, ``), (err, token) => {
                if (!err && token)
                    handleResponse(req, res, 200, {
                        message: `Success`,
                        user: token.client.user
                    });
                else
                    handleResponse(req, res, 403, {
                        message: `Failed`
                    });
            });
        };
    }

    /**
     * Send headers
     * Authorization: Bearer <access_token>
     * @description: Will set req.user to the authorized user
     */

    authorize() {
        return (req, res, next) => {
            if (req.headers.authorization)
                this.model.getUserByAccessToken(req.headers.authorization.replace(`Bearer `, ``), (err, token) => {
                    if (!err && token)
                        this.getUserFromAccessToken(req.headers.authorization, (err, user) => {
                            if (!err && user) {
                                req.user = user;
                                next();
                            } else handleResponse(req, res, 403, generateError(`Authorize`));
                        });
                    else {
                        handleResponse(req, res, 403, generateError(`Authorize`));
                    }
                });
            else handleResponse(req, res, 403, generateError(`Authorize`));
        };
    }

    refresh() {
        return (req, res) => {
            this.model.getRefreshToken(req.body.refresh_token, success => {
                if (success)
                    this.model.getClient(req.body.client_id, req.body.client_secret, success => {
                        if (success)
                            this.__generateAccessToken(
                                req.body.refresh_token,
                                req.body.client_id,
                                req.body.client_secret,
                                null,
                                (err, access_token) => {
                                    handleResponse(req, res, 200, {
                                        access_token: access_token.token,
                                        expire_date: access_token.expire_date,
                                        refresh_token: access_token.refresh_token,
                                        issue_date: Date.now()
                                    });
                                }
                            );
                        else handleResponse(req, res, 403, generateError(`Token`));
                    });
                else handleResponse(req, res, 403, generateError(`Refresh`));
            });
        };
    }

    __generateToken(client_id, cb) {
        const nonce = Math.floor(Date.now() / 100000);
        const token = this.__hash256(`${client_id}:${nonce}`);
        this.model.saveToken(token, client_id, nonce, success => {
            if (success) cb(null, token);
            else cb(generateError(`Token`), null);
        });
    }

    __generateAccessToken(token, client_id, client_secret, metadata, cb) {
        const nonce = Date.now();
        const salt = this.__hash256(`${nonce}`);
        const access_token_token = this.__hash512(`${token}:${client_secret}:${salt}`);
        const access_token_refresh = this.__hash512(`${token}:${client_secret}:${client_id}:${salt}`);
        const access_token = {
            token: access_token_token,
            client_id: client_id,
            expire_date: Date.now() + this.options.expire_time,
            refresh_token: access_token_refresh
        };
        this.model.saveAccessToken(access_token, metadata, success => {
            if (success) {
                this.model.removeToken(token, success => {
                    if (success) cb(null, access_token);
                    else cb(generateError(`Authenticate`), null);
                });
            } else cb(generateError(`Authenticate`), null);
        });
    }
}

const generateError = type => {
    const err = {};
    switch (type) {
        case `Token`:
            err.code = `TOKEN`;
            err.message = `Unknown client_id!`;
            break;
        case `Authenticate`:
            err.code = `AUTHENTICATE`;
            err.message = `Token invalid or expired!`;
            break;
        case `Authorize`:
            err.code = `AUTHORIZE`;
            err.message = `Accesstoken invalid or expired!`;
            break;
        case `Refresh`:
            err.code = `REFRESH`;
            err.message = `Refreshtoken invalid or expired!`;
            break;
        default:
            err.code = `ERR`;
            err.message = `Error`;
            break;
    }
    return err;
};

const handleResponse = (req, res, status, response, redirect) => {
    if (redirect) res.redirect(redirect);
    else res.status(status).json(response);
};

module.exports = TapAuth;
