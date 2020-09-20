const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const mongooseAutoIncrement = require('mongoose-auto-increment');

mongooseAutoIncrement.initialize(mongoose.connection);

const CategorySchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    }
});

CategorySchema.plugin(mongoosePaginate);
CategorySchema.plugin(mongooseAutoIncrement.plugin, { model: 'Category', field: 'id', startAt: 1, incrementBy: 1 });

mongoose.model('Category', CategorySchema);