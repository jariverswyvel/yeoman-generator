const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema(
    {
        amount: Number,
        currency: String,
        deleted_on: Date,
        method: String,
        cc_number: String,
        cc_cvc: String,
        cc_exp_month: String,
        cc_exp_year: String,
        created_on: {type: Date, default: Date.now},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        company: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'}
    },
    {
        usePushEach: true
    }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
