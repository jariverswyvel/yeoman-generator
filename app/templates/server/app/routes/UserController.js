const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {Joi, celebrate} = require('celebrate');
const TapAuth = require('../auth/TapAuth-v2');
const hash = require('../../lib/crypto/hash');

router.auth = new TapAuth(require('../auth/models/mongodb'));

router.post(
    '/login',
    celebrate({
        body: Joi.object().keys({
            username: Joi.string().required(),
            password: Joi.string().required()
        })
    }),
    (req, res) => {
        User.findOne(
            {
                $or: [
                    {
                        username: req.body.username
                    },
                    {
                        email: req.body.username
                    }
                ],
                password: hash.hash(req.body.password)
            },
            '-password'
        ).exec((err, user) => {
            if (!err && user) {
                user.ip_last_logged_in = req.headers['x-real-ip'] || req.connection.remoteAddress;
                user.last_logged_in_date = Date.now();
                user.save((err, savedUser) => {
                    if (!err)
                        router.auth.getClientData(user, (err, token) => {
                            if (!err && token)
                                router.auth.generateAccessToken(
                                    token.client_id,
                                    token.client_secret,
                                    req.body.password,
                                    {
                                        ip: user.ip_last_logged_in,
                                        device_os: req.headers['user-agent'],
                                        device_name: req.headers['user-agent']
                                    },
                                    (err, token) => {
                                        if (!err)
                                            res.json({
                                                message: 'Success',
                                                token: token.token,
                                                user: user
                                            });
                                        else res.json({message: 'Failed', error: err.message});
                                    }
                                );
                            else res.json({message: 'Failed', error: err ? err.message : 'No token data'});
                        });
                    else res.json({message: 'Failed', error: err.message});
                });
            } else
                res.json({
                    message: 'Failed',
                    error: err ? err.message : 'Username / Password incorrect'
                });
        });
    }
);

module.exports = router;
