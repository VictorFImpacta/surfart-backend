const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const mongooseAutoIncrement = require('mongoose-auto-increment');
const audit = require('./plugins/index');

const OrderSchema = new mongoose.Schema({
    id: {
        type: Number
    },
    customer: {
        type: Object,
        required: true,
    },
    items: {
        type: Array,
        required: true,
    },
    value: {
        type: Number,
        required: true
    },
    hasDiscount: {
        type: Boolean,
        default: false
    },
    discount: {
        type: Number
    },
    toDelivery: {
        type: Boolean,
        required: true
    },
    billing_address: {
        type: Object,
        required: true
    },
    notes: {
        type: String
    },
    canceled: {
        type: Boolean,
        default: false
    },
    canceled_reason: {
        type: String
    },
    shipped: {
        type: Boolean,
        default: false
    },
    shipped_date: {
        type: Date
    }
});

OrderSchema.plugin(audit);
OrderSchema.plugin(mongooseAutoIncrement.plugin, { model: 'Order', field: 'id', startAt: 1, incrementBy: 1 });
OrderSchema.plugin(mongoosePaginate);

mongoose.model('Order', OrderSchema);