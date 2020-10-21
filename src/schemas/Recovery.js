const mongoose = require('mongoose');
const audit = require('./plugins/index');

const RecoverySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: false
    },
    recovery_check: {
        type: String,
        unique: false,
        default: new Date().getTime()
    },
    recovery_code: {
        type: String,
        unique: true,
        required: true,
    },
    recovered: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: new Date()
    }
});

mongoose.model('Recovery', RecoverySchema);