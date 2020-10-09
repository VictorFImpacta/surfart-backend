const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = function audit(schema, options) {
    schema.add({
        created_at: { type: Date, required: true, default: Date.now },
        updated_at: { type: Date },
        deleted: { type: Boolean, default: false }
    });
}