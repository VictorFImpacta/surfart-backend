const mongoose = require('mongoose');

const PicpaySchema = new mongoose.Schema({
    referenceId: {
        type: String,
        required: true
    },
    orderId: {
        type: Number,
        required: true
    },
    callbackUrl: {
        type: String,
        default: 'https://surfart-homolog.herokuapp.com/api/orders/740129c9-9073-4a78-8565-95ef30c1881f/callback'
    },
    returnUrl: {
        type: String,
        default: 'https://surfartbrazil.herokuapp.com/pedidos'
    },
    value: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    buyer: {
        first_name: String,
        last_name: String,
        document: String,
        email: String,
        phone: String,
    }
});

mongoose.model('Picpay', PicpaySchema);