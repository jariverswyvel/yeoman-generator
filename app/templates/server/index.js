/**
 * @author Xander Van Raemdonck
 * @email xander[at]tntap.be
 * @create date 2018-03-26 09:45:10
 * @modify date 2018-03-26 09:45:10
 * @desc [description]
 */

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
require('dotenv').config();
const db = require('./config/db');
const path = require('path');
const morgan = require('morgan');
const logger = require('winston');
const {Joi, celebrate, errors} = require('celebrate');
const TapAuth = require('./app/auth/TapAuth-v2');

app.auth = new TapAuth(require('./app/auth/models/mongodb'));
morgan.token('http-x-real-ip', (req, res) => {
    return req.headers['x-real-ip'];
});
morgan.token('http-body', (req, res) => {
    return JSON.stringify(req.body);
});
app.use(
    morgan(
        ':http-x-real-ip [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :http-body'
    )
);

app.enable('trust proxy');
const dir = path.join(__dirname, 'Storage');
app.use(express.static(dir));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.raw({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));

// Setup CORS

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, authorization, user-agent, accept');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    next();
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: app.get('env') === 'development' ? err : {}
    });
    next(err);
});

app.get(
    '/validate',
    celebrate({
        headers: Joi.object()
            .keys({
                authorization: Joi.string().required()
            })
            .unknown()
    }),
    app.auth.validate()
);

app.use('/users', require('./app/routes/UserController'));

app.get('/', (req, res) => {
    res.json({
        message: 'Success',
        info: app.get('env') === 'development' ? 'TEST' : {}
    });
});

app.use(errors());
app.listen(process.env.NODE_PORT, () => logger.info(`API is listening on port ${process.env.NODE_PORT}`));
