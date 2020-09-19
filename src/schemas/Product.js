const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const mongooseAutoIncrement = require('mongoose-auto-increment');

mongooseAutoIncrement.initialize(mongoose.connection);

const ProductSchema = new mongoose.Schema({
    id: {
        type: Number,
    },
    title: {
        type: String,
        required: true
    },
    category: {
        type: [Number], //tentar substituir por [CategorySchema]
        required: true
    },
    created_at: {
        type: Date,
        default: new Date()
    },
    updated_at: {
        type: Date,
        default: new Date()
    },
    tags: {
        type: [String]
    },
    image: {
        type: String,
        required: true
    },
    rate_stars: {
        type: Number,
        required: false,
        default: 0
    },
    price: {
        type: Number,
        default: 100.00
    },
    variants: []
});

ProductSchema.plugin(mongooseAutoIncrement.plugin, { model: 'Product', field: 'id', startAt: 1, incrementBy: 1 });
ProductSchema.plugin(mongoosePaginate);

mongoose.model('Product', ProductSchema);