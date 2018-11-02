const mongoose = require('mongoose');

const licenseSchema = mongoose.Schema({
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    remaining: Number,
    amount: Number,
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    type: String,
    payments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment'
        }
    ],
    key: String,
    stripe_subscription: String,
    stripe_plan: String,
    expiration_date: Date,
    created_on: {
        type: Date,
        default: Date.now
    },
    deleted_on: Date,
    canceled_on: Date
}, {usePushEach: true});

const License = mongoose.model('License', licenseSchema);

module.exports = License;
