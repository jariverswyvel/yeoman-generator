const mongoose = require('mongoose');

const pricingSchema = mongoose.Schema(
    {
        name: String,
        period: {type: String, default: 'year'},
        price: Number,
        active: {type: Boolean, default: true},
        created_on: {
            type: Date,
            default: Date.now
        },
        deleted_on: Date
    },
    {
        usePushEach: true
    }
);

const Pricing = mongoose.model('Pricing', pricingSchema);

Pricing.getSchema = () => pricingSchema;

module.exports = Pricing;
