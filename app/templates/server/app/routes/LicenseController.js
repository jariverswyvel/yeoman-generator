/**
 * @author Xander Van Raemdonck
 * @email xander[at]tntap.be
 * @create date 2018-03-26 03:38:39
 * @modify date 2018-03-26 03:38:39
 * @desc [description]
 */

const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const License = require('../models/license');
const User = require('../models/user');
const Company = require('../models/company');
const Payment = require('../models/payment');
const Pricing = require('../models/pricing');
const {Joi, celebrate, errors} = require('celebrate');
const TapAuth = require('../auth/TapAuth');
const hash = require('../../lib/crypto/hash');

const stripe = require('stripe')('sk_test_50fT2I5Q3fQH4RZstGoS1T38');
const endpointSecret = 'whsec_R1AwsDiLU9zSc46vb87QknZfb2B9HPU8';

router.auth = new TapAuth(require('../auth/models/mongodb'));

router.post('/webhook', bodyParser.raw({type: '*/*'}), (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        if (event.type === 'charge.succeeded') {
            stripe.customers.retrieve(event.data.object.customer, (err, customer) => {
                if (!err) {
                    Company.findOne({deleted_on: null, stripe_id: customer.id}, (err, company) => {
                        if (!err && company) {
                            License.findOne({company: company, deleted_on: null}, (err, license) => {
                                if (!err && license) {
                                    const expiration_date =
                                        license.type === 'month'
                                            ? new Date(Date.now() + 1000 * 3600 * 24 * 31)
                                            : new Date(Date.now() + 1000 * 3600 * 24 * 365);
                                    Payment.create(
                                        {
                                            amount: event.data.object.amount / 100,
                                            currency: event.data.object.currency,
                                            method: event.data.object.source.object,
                                            company: company,
                                            cc_number: event.data.object.source.last4,
                                            cc_exp_month: event.data.object.source.exp_month,
                                            cc_exp_year: event.data.object.source.exp_year
                                        },
                                        (err, payment) => {
                                            if (!err) {
                                                license.expiration_date = expiration_date;
                                                license.payments
                                                    ? license.payments.push(payment)
                                                    : (license.payments = [payment]);
                                                license.save((err, savedLicense) => {
                                                    if (!err) console.log('PAID');
                                                    else console.log(err.message);
                                                });
                                            }
                                        }
                                    );
                                } else console.log(err ? err.message : 'No license found!');
                            });
                        } else console.log(err ? err.message : 'No company found!');
                    });
                } else console.log(err.message);
            });
        }
        // Return a response
        res.status(200).send('Signed Webhook Received: ' + event.id);
        // Do something with event
    } catch (err) {
        res.status(400).end();
    }
});

router.use(bodyParser.json());

router.get(
    '/',
    celebrate({
        headers: Joi.object({
            authorization: Joi.string().required()
        }).unknown()
    }),
    router.auth.authorize(),
    (req, res) => {
        License.find({deleted_on: null, company: req.user.company}).exec((err, licenses) => {
            if (!err) res.json({message: 'Success', licenses: licenses});
            else res.json({message: 'Failed', error: err.message});
        });
    }
);

router.get(
    '/check',
    celebrate({
        headers: Joi.object({
            authorization: Joi.string().required()
        }).unknown()
    }),
    router.auth.authorize(),
    (req, res) => {
        License.find(
            {
                deleted_on: null,
                company: req.user.company,
                users: req.user,
                expiration_date: {
                    $gte: Date.now()
                }
            },
            'key expiration_date remaining type -_id'
        ).exec((err, licenses) => {
            if (!err && licenses.length > 0) res.json({message: 'Success', licenses: licenses});
            else
                res.json({
                    message: 'Failed',
                    error: err ? err.message : 'Unlicensed!'
                });
        });
    }
);

router.post(
    '/',
    celebrate({
        headers: Joi.object({
            authorization: Joi.string().required()
        }).unknown(),
        body: Joi.object().keys({
            type: Joi.string()
                .required()
                .default('year'),
            remaining: Joi.number()
                .integer()
                .required()
                .default(5)
        })
    }),
    router.auth.authorize(),
    (req, res) => {
        const {type, remaining} = req.body;
        const expiration_date = null;
        const key = hash.sha256(`${req.user.username}:${req.user.company}:${Date.now()}:${remaining}`);
        License.create(
            {
                users: [req.user],
                remaining: remaining - 1,
                amount: remaining,
                company: req.user.company,
                type: type,
                key: key,
                expiration_date: expiration_date
            },
            (err, license) => {
                if (!err)
                    res.json({
                        message: 'Success',
                        license: {
                            _id: license._id,
                            key: license.key,
                            expiration_date: license.expiration_date,
                            remaining: license.remaining,
                            type: license.type
                        }
                    });
                else res.json({message: 'Failed', error: err.message});
            }
        );
    }
);

const fetch_stripe_customer = (user, cb) => {
    if (user.stripe_id)
        stripe.customers.retrieve(user.stripe_id, (err, customer) => {
            if (!err && customer && !customer.deleted) {
                cb(null, customer);
            } else {
                stripe.customers.create(
                    {
                        email: user.email
                    },
                    (err, customer) => {
                        cb(err, customer);
                    }
                );
            }
        });
    else
        stripe.customers.create(
            {
                email: user.email
            },
            (err, customer) => {
                cb(err, customer);
            }
        );
};

const fetch_stripe_source = (customer, object, cb) => {
    if (customer.default_source)
        stripe.sources.retrieve(customer.default_source.id, (err, source) => {
            if (!err && source) {
                cb(null, source);
            } else {
                stripe.customers.createSource(
                    customer.id,
                    {
                        source: object
                    },
                    (err, card) => {
                        cb(err, card);
                    }
                );
            }
        });
    else
        stripe.customers.createSource(
            customer.id,
            {
                source: object
            },
            (err, card) => {
                cb(err, card);
            }
        );
};

router.post(
    '/subscribe',
    celebrate({
        headers: Joi.object({
            authorization: Joi.string().required()
        }).unknown(),
        body: Joi.object().keys({
            type: Joi.string()
                .required()
                .default('year'),
            amount: Joi.number()
                .required()
                .default(5),
            currency: Joi.string().required(),
            method: Joi.string().required(),
            card_number: Joi.string().required(),
            card_cvc: Joi.number().required(),
            exp_month: Joi.number().required(),
            exp_year: Joi.number().required()
        })
    }),
    router.auth.authorize(),
    (req, res) => {
        const {amount, type, currency, method, exp_month, exp_year, card_number, card_cvc} = req.body;
        const expiration_date = null;
        Pricing.findOne(
            {
                deleted_on: null,
                active: true,
                period: type
            },
            (err, pricing) => {
                stripe.plans.create(
                    {
                        product: {
                            name: `Archyve License ${amount}x`
                        },
                        currency: currency,
                        interval: type,
                        nickname: `Archyve License ${amount}x`,
                        amount: parseFloat(amount) * pricing.price * 100
                    },
                    (err, plan) => {
                        fetch_stripe_customer(req.user, (err, customer) => {
                            if (!err) {
                                fetch_stripe_source(
                                    customer,
                                    {
                                        object: 'card',
                                        exp_month: exp_month,
                                        exp_year: exp_year,
                                        number: card_number,
                                        cvc: card_cvc
                                    },
                                    (err, source) => {
                                        if (!err) {
                                            stripe.subscriptions.create(
                                                {
                                                    customer: customer.id,
                                                    items: [
                                                        {
                                                            plan: plan.id
                                                        }
                                                    ]
                                                },
                                                (err, subscription) => {
                                                    const key = hash.sha256(
                                                        `${req.user.username}:${req.user.company}:${Date.now()}:${amount}`
                                                    );
                                                    License.create(
                                                        {
                                                            users: [req.user],
                                                            remaining: amount - 1,
                                                            amount: amount,
                                                            company: req.user.company,
                                                            type: type,
                                                            key: key,
                                                            expiration_date: expiration_date,
                                                            stripe_subscription: subscription.id,
                                                            stripe_plan: plan.id
                                                        },
                                                        (err, license) => {
                                                            if (!err) {
                                                                Company.findOne(
                                                                    {
                                                                        deleted_on: null,
                                                                        _id: req.user.company
                                                                    },
                                                                    (err, company) => {
                                                                        if (!err && company) {
                                                                            company.stripe_id = customer.id;
                                                                            if (
                                                                                company.cards &&
                                                                                !company.cards.find(x => {
                                                                                    return (
                                                                                        x.card_number ===
                                                                                        card_number.substr(-4, 4)
                                                                                    );
                                                                                })
                                                                            ) {
                                                                                const card = {
                                                                                    exp_month: exp_month,
                                                                                    exp_year: exp_year,
                                                                                    card_number: card_number.substr(-4, 4),
                                                                                    name: company.name
                                                                                };
                                                                                company.cards
                                                                                    ? company.cards.push(card)
                                                                                    : (company.cards = [card]);
                                                                            }
                                                                            company.save((err, savedCompany) => {
                                                                                if (!err) res.json({message: 'Success'});
                                                                                else
                                                                                    res.json({
                                                                                        message: 'Failed',
                                                                                        error: err.message
                                                                                    });
                                                                            });
                                                                        } else
                                                                            res.json({
                                                                                message: 'Failed',
                                                                                error: err ? err.message : 'No company found!'
                                                                            });
                                                                    }
                                                                );
                                                            } else res.json({message: 'Failed', error: err.message});
                                                        }
                                                    );
                                                }
                                            );
                                        } else res.json({message: 'Failed', error: err.message});
                                    }
                                );
                            } else res.json({message: 'Failed', error: err.message});
                        });
                    }
                );
            }
        );
    }
);

router.delete(
    '/:id([0-9a-fA-F]{24})/unsubscribe',
    celebrate({
        headers: Joi.object({
            authorization: Joi.string().required()
        }).unknown(),
        params: Joi.object().keys({
            id: Joi.string().required()
        })
    }),
    router.auth.authorize(),
    (req, res) => {
        License.findOne(
            {
                deleted_on: null,
                company: req.user.company,
                _id: req.params.id
            },
            (err, license) => {
                if (!err && license) {
                    if (license.stripe_subscription) {
                        stripe.subscriptions.del(
                            license.stripe_subscription,
                            {
                                at_period_end: true
                            },
                            (err, confirmation) => {
                                if (!err) {
                                    license.canceled_on = Date.now();
                                    license.save((err, savedLicense) => {
                                        if (!err) res.json({message: 'Success'});
                                        else res.json({message: 'Failed', error: err.message});
                                    });
                                } else res.json({message: 'Failed', error: err.message});
                            }
                        );
                    } else res.json({message: 'Failed', error: 'License is not paid!'});
                } else
                    res.json({
                        message: 'Failed',
                        error: err ? err.message : 'No license found!'
                    });
            }
        );
    }
);

router.put(
    '/:id([0-9a-fA-F]{24})',
    celebrate({
        headers: Joi.object({
            authorization: Joi.string().required()
        }).unknown(),
        params: Joi.object().keys({
            id: Joi.string().required()
        }),
        body: Joi.object().keys({
            amount: Joi.number()
                .integer()
                .required(),
            type: Joi.string()
                .required()
                .default('year')
        })
    }),
    router.auth.authorize(),
    (req, res) => {
        License.findOne(
            {
                deleted_on: null,
                company: req.user.company,
                _id: req.params.id
            },
            (err, license) => {
                if (!err && license && license.stripe_subscription) {
                    if (license.stripe_plan) {
                        const {amount, type} = req.body;
                        stripe.plans.del(license.stripe_plan, (err, confirmation) => {
                            stripe.plans.create(
                                {
                                    product: {
                                        name: `Archyve License ${amount}x`
                                    },
                                    currency: currency,
                                    interval: type,
                                    nickname: `Archyve License ${amount}x`,
                                    amount: parseFloat(amount) * 100
                                },
                                (err, plan) => {
                                    if (!err) {
                                        stripe.subscriptions.update(
                                            license.stripe_subscription,
                                            {
                                                items: [
                                                    {
                                                        plan: plan.id
                                                    }
                                                ]
                                            },
                                            (err, subscription) => {
                                                if (!err) {
                                                    license.stripe_plan = plan.id;
                                                    license.stripe_subscription = subscription.id;
                                                    license.save((err, savedLicense) => {
                                                        if (!err) res.json({message: 'Success'});
                                                        else res.json({message: 'Failed', error: err.message});
                                                    });
                                                } else res.json({message: 'Failed', error: err.message});
                                            }
                                        );
                                    } else res.json({message: 'Failed', error: err.message});
                                }
                            );
                        });
                    } else {
                    }
                } else
                    res.json({
                        message: 'Failed',
                        error: err ? err.message : 'No license found!'
                    });
            }
        );
    }
);

router.post(
    '/:id([0-9a-fA-F]{24})',
    celebrate({
        headers: Joi.object({
            authorization: Joi.string().required()
        }).unknown(),
        params: Joi.object().keys({
            id: Joi.string().required()
        }),
        body: Joi.object().keys({
            user: Joi.string().required()
        })
    }),
    router.auth.authorize(),
    (req, res) => {
        User.findOne(
            {
                deleted_on: null,
                company: req.user.company,
                _id: req.body.user
            },
            (err, user) => {
                if (!err && user) {
                    License.findOne(
                        {
                            deleted_on: null,
                            company: req.user.company,
                            _id: req.params.id
                        },
                        (err, license) => {
                            if (!err && license) {
                                if (license.remaining >= 1) {
                                    if (license.users.indexOf(user._id) === -1) {
                                        license.users.push(user);
                                        license.remaining--;
                                        license.save((err, savedLicense) => {
                                            if (!err) res.json({message: 'Success'});
                                            else res.json({message: 'Failed', error: err.message});
                                        });
                                    } else res.status(405).json({message: 'Failed', error: 'User is already licensed.'});
                                } else res.status(405).json({message: 'Failed', error: 'No more licenses available.'});
                            } else
                                res.json({
                                    message: 'Failed',
                                    error: err ? err.message : 'No license found!'
                                });
                        }
                    );
                } else
                    res.json({
                        message: 'Failed',
                        error: err ? err.message : 'No user found!'
                    });
            }
        );
    }
);

router.delete(
    '/:id([0-9a-fA-F]{24})/unlicense',
    celebrate({
        headers: Joi.object({
            authorization: Joi.string().required()
        }).unknown(),
        params: Joi.object().keys({
            id: Joi.string().required()
        }),
        body: Joi.object().keys({
            user: Joi.string().required()
        })
    }),
    router.auth.authorize(),
    (req, res) => {
        User.findOne(
            {
                deleted_on: null,
                company: req.user.company,
                _id: req.body.user
            },
            (err, user) => {
                if (!err && user) {
                    License.findOne(
                        {
                            deleted_on: null,
                            company: req.user.company,
                            _id: req.params.id
                        },
                        (err, license) => {
                            if (!err && license) {
                                if (license.users.indexOf(user._id) > -1) {
                                    license.users.splice(license.users.indexOf(user._id), 1);
                                    license.remaining++;
                                    license.save((err, savedLicense) => {
                                        if (!err) res.json({message: 'Success'});
                                        else res.json({message: 'Failed', error: err.message});
                                    });
                                } else res.status(405).json({message: 'Failed', error: 'User is already unlicensed.'});
                            } else
                                res.json({
                                    message: 'Failed',
                                    error: err ? err.message : 'No license found!'
                                });
                        }
                    );
                } else
                    res.json({
                        message: 'Failed',
                        error: err ? err.message : 'No user found!'
                    });
            }
        );
    }
);

module.exports = router;
