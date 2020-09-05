const mongoose = require('mongoose');

const PicpayRedirectSchema = new mongoose.Schema({
    referenceId: {
        type: String,
        required: true
    },
    paymentUrl: {
        type: String,
        required: true
    },
    qrcode: {
        content: String,
        base64: String
    },
    expiresAt: {
        type: Date,
        required: true
    },
    cancellationId: {
        type: String
    },
    canceled: {
        type: Boolean,
        default: false
    }
});

mongoose.model('PicpayRedirect', PicpayRedirectSchema);