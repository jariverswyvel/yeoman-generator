/*
* @Author: TnTap
* @Date:   2018-03-28 11:37:32
* @Last Modified by:   xandervr
* @Last Modified time: 2018-03-28 11:37:32
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
            if (!err && token && token.client) cb(null, token.client.user);
            else cb(err, null);
        });
    }

    validate() {
        return (req, res) => {
            this.model.getUserByAccessToken(req.headers.authorization.replace(`Bearer `, ``), (err, token) => {
                if (!err && token && token.client)
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

    generateAccessToken(client_id, client_secret, client_password, metadata = null, cb) {
        const nonce = Date.now();
        const salt = this.__hash256(`${nonce}`);
        const access_token_token = this.__hash512(
            `${client_password}:${this.__hash256(client_secret)}:${this.__hash256(client_password)}:${salt}`
        );
        const access_token_refresh = this.__hash512(`${client_password}:${client_secret}:${client_id}:${salt}`);
        const access_token = {
            token: access_token_token,
            client_id: client_id,
            expire_date: Date.now() + this.options.expire_time,
            refresh_token: access_token_refresh
        };
        this.model.saveAccessToken(access_token, metadata, success => {
            if (success) {
                cb(null, access_token);
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
