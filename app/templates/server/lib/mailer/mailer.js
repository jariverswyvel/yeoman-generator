/**
 * @author Xander Van Raemdonck
 * @email xander[at]tntap.be
 * @create date 2018-03-09 04:03:31
 * @modify date 2018-03-09 04:03:31
 * @desc [description]
 */

const nodemailer = require('nodemailer');

class Mailer {
    constructor(options) {
        this.poolConfig = {
            pool: true,
            host: options.host,
            port: options.port,
            secure: false,
            requireTLS: true,
            auth: {
                user: options.user,
                pass: options.pass
            }
        };

        this.transporter = nodemailer.createTransport(this.poolConfig);
    }

    sendMail(from, to, subject, body, cb) {
        const message = {from: from, to: to, subject: subject, html: body};
        this.transporter.sendMail(message, (err, info) => {
            cb(err, info);
        });
    }
}

module.exports = Mailer;
