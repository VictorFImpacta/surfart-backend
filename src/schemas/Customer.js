const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const mongooseAutoIncrement = require('mongoose-auto-increment');
const audit = require('./plugins/index');

const CustomerSchema = new mongoose.Schema({
    id: {
        type: Number
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
    password: {
        type: String,
        required: true,
        select: false
    },
    historic: {
        type: Array,
        default: []
    },
    addresses: [{
        cep: { type: String, required: true },
        address: { type: String, required: true },
        neighborhood: { type: String, required: true },
        location: { type: String, required: true },
        state: { type: String, required: true },
        number: { type: String, required: true },
        complement: { type: String }
    }],
    admin: {
        type: Boolean,
        default: false
    }
});

CustomerSchema.pre('save', async function () {
    const times = Math.floor(Math.random())
    this.password = await bcrypt.hash(this.password, times);
});

CustomerSchema.plugin(audit);
CustomerSchema.plugin(mongooseAutoIncrement.plugin, { model: 'Customer', field: 'id', startAt: 1, incrementBy: 1 });
CustomerSchema.plugin(mongoosePaginate);

mongoose.model('Customer', CustomerSchema);