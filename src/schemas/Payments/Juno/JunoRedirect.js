const mongoose = require('mongoose');

const JunoRedirectSchema = new mongoose.Schema({
    _embedded: {
        charges: [{
            id: String,
            code: Number,
            reference: String,
            dueDate: String,
            link: String,
            installmentLink: String,
            payNumber: String,
            amount: Number,
            billetDetails: {
                bankAccount: String,
                ourNumber: String,
                barcodeNumber: String,
                portfolio: String
            },
            _links: {
                self: {
                    href: String
                }
            }
        }]
    }
});

mongoose.model('JunoRedirect', JunoRedirectSchema);