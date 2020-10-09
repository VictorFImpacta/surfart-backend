const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const mongooseAutoIncrement = require('mongoose-auto-increment');
const audit = require('./plugins/index');

mongooseAutoIncrement.initialize(mongoose.connection);

const SkuSchema = new mongoose.Schema({
    product_id: {
        type: Number,
        required: true
    },
    id: {
        type: Number
    },
    description: {
        type: String
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    old_price: {
        type: Number,
        required: true
    },
    promotion: {
        type: Boolean,
        default: false
    },
    ean: {
        type: Number,
        required: false
    },
    height: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    availableStock: {
        type: Number,
        required: true
    },
    images: []
});

SkuSchema.plugin(audit);
SkuSchema.plugin(mongooseAutoIncrement.plugin, { model: 'Sku', field: 'id', startAt: 1, incrementBy: 1 });
SkuSchema.plugin(mongoosePaginate);

mongoose.model('Sku', SkuSchema);