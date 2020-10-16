const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const mongooseAutoIncrement = require('mongoose-auto-increment');
const audit = require('./plugins/index');

// const ItemSchema = new mongoose.Schema({
//     id: {
//         type: Number,
//         required: true
//     },
//     quantity: {
//         type: Number,
//         required: true
//     },
//     unitPrice: {
//         type: Number,
//         required: true
//     },
//     totalPrice: {
//         type: Number,
//         required: true
//     }
// })

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
        required: false
    },
    billing_address: {
        type: Object,
        required: false
    },
    notes: {
        type: String
    },
    canceled_reason: {
        type: String
    },
    shipped_date: {
        type: Date
    },
    status: {
        type: String,
        uppercase: true,
        enum: ['OPEN', 'PAID', 'SEPARATED', 'SHIPPED', 'FINALIZED', 'CANCELED'],
        default: 'OPEN'
    }
});

OrderSchema.plugin(audit);
OrderSchema.plugin(mongooseAutoIncrement.plugin, { model: 'Order', field: 'id', startAt: 1, incrementBy: 1 });
OrderSchema.plugin(mongoosePaginate);

mongoose.model('Order', OrderSchema);