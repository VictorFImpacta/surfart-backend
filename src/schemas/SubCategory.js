const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const mongooseAutoIncrement = require('mongoose-auto-increment');

mongooseAutoIncrement.initialize(mongoose.connection);

const SubCategorySchema = new mongoose.Schema({
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
    },
    category_id: {
        type: String
    }
});

SubCategorySchema.plugin(mongoosePaginate);
SubCategorySchema.plugin(mongooseAutoIncrement.plugin, { model: 'SubCategory', field: 'id', startAt: 1, incrementBy: 1 });
mongoose.model('SubCategory', SubCategorySchema);