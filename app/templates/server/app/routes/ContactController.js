const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {Joi, celebrate} = require('celebrate');
const TapAuth = require('../auth/TapAuth-v2');
const Mailer = require('../../lib/mailer/mailer');
const aes = require('../../lib/crypto/aes');

router.auth = new TapAuth(require('../auth/models/mongodb'));

router.post(
    '/contact',
    celebrate({
        body: Joi.object().keys({
            naam: Joi.string().required(),
            email: Joi.string().required(),
            bericht: Joi.string().required()
        })
    }),
    (req, res) => {
        User.findOne({site: req.site, deleted_on: null}, (err, user) => {
            if (!err && user) {
                const mailOptions = {
                    host: req.site.smtp.host,
                    port: req.site.smtp.port,
                    user: req.site.smtp.user,
                    pass: aes.AESDecrypt(req.site.smtp.pass, user.password)
                };
                Mailer(mailOptions).sendMail(
                    '"Contact Website" example@example.be',
                    'xample@example.be',
                    'Contact Website',
                    `<html>
                    <body>
                    <table>
                    <tr>
                    <td>Naam:</td><td>${req.body.naam}</td>
                    </tr>
                    <tr>
                    <td>Email:</td><td>${req.body.email}</td>
                    </tr>
                    <tr>
                    <td>Bericht:</td><td>${req.body.bericht}</td>
                    </tr>
                    </table>
                    </body>
                    </html>`,
                    (err, info) => {
                        if (!err) res.json({message: 'Success'});
                        else res.json({message: 'Failed', error: err.message});
                    }
                );
            } else res.json({message: 'Failed', error: err ? err.message : 'No user found!'});
        });
    }
);

module.exports = router;
