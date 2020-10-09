const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const mongooseAutoIncrement = require('mongoose-auto-increment');
const audit = require('./plugins/index');

mongooseAutoIncrement.initialize(mongoose.connection);

const ProductSchema = new mongoose.Schema({
    id: {
        type: Number
    },
    title: {
        type: String,
        required: true
    },
    category: {
        type: Number,
        required: true
    },
    tags: {
        type: [String]
    },
    rate_stars: {
        type: Number,
        required: false,
        default: 0
    },
    variants: [{
        type: Number,
        required: true
    }]
});

ProductSchema.plugin(audit);
ProductSchema.plugin(mongooseAutoIncrement.plugin, { model: 'Product', field: 'id', startAt: 1, incrementBy: 1 });
ProductSchema.plugin(mongoosePaginate);

mongoose.model('Product', ProductSchema);