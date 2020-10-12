const mongoose = require('mongoose');

const PicpaySchema = new mongoose.Schema({
    referenceId: {
        type: String,
        required: true
    },
    callbackUrl: {
        type: String,
        default: 'http://www.callback.com/surfart'
    },
    returnUrl: {
        type: String,
        default: 'http://www.surfartstore.com/cart'
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