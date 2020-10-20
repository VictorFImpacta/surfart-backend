const mongoose = require('mongoose');

const PicpaySchema = new mongoose.Schema({
    charge: {
        description: {
            type: String,
            required: true
        },
        amount: {
            type: String,
            required: true
        },
        dueDate: "2020-10-19",
        maxOverdueDays: 0,
        fine: 0,
        interest: "0.00",
        discountAmount: "0.00",
        discountDays: -1,
        paymentTypes: [],
        paymentAdvance: true
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