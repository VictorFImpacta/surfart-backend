const mongoose = require('mongoose');

const JunoSchema = new mongoose.Schema({
    order_id: { type: String, required: true },
    charge: {
        description: {
            type: String,
            required: true
        },
        amount: {
            type: String,
            required: true
        },
        dueDate: {
            type: Date,
            default: new Date()
        },
        paymentAdvance: {
            type: Boolean,
            default: true
        }
    },
    billing: {
        name: String,
        document: String,
        email: String,
        phone: String,
        notify: { type: Boolean, default: true }
    }
});

mongoose.model('Juno', JunoSchema);