const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const mongooseAutoIncrement = require('mongoose-auto-increment');
const audit = require('./plugins/index');

const CustomerSchema = new mongoose.Schema({
    id: {
        type: Number
    },
    password: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        type: Array,
        default: []
    },
    historic: {
        type: Array,
        default: []
    },
    admin: {
        type: Boolean,
        default: false
    }
});

CustomerSchema.pre('save', async function() {
    this.password = await bcrypt.hash(this.password, 10);
});

CustomerSchema.plugin(audit);
CustomerSchema.plugin(mongooseAutoIncrement.plugin, { model: 'Customer', field: 'id', startAt: 1, incrementBy: 1 });
CustomerSchema.plugin(mongoosePaginate);

mongoose.model('Customer', CustomerSchema);