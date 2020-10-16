const mongoose = require('mongoose');
const Product = require('./Product');
mongoose.set('useFindAndModify', false);

const CategoryModel = mongoose.model('Category');
const ProductModel = mongoose.model('Product');

const selectString = '-_id -__v';

class Category {

    constructor() {
        this.result = [];
        this.statusCode = 200;
    };

    setResponse(result, statusCode = 200) {
        this.result = result;
        this.statusCode = statusCode;
    }

    response() {
        return {
            result: this.result,
            statusCode: this.statusCode
        };
    }

    validate(data, validateArray) {
        const missing = new Array();
        validateArray.forEach(item => {
            if (!data[item]) missing.push(item);
        });
        if (missing.length) {
            const result = {
                message: `The fields are missing: ${missing.join().replace(/\,/g, ', ')}`
            };
            data.isInvalid = true;
            this.setResponse(result, 400);
        }
        return data;
    }

    formatRequest(data, isUpdated = false) {
        data.id = undefined;
        data.rate_stars = undefined;
        data.created_at = undefined;

        if (isUpdated) {
            data.updated_at = undefined;
        }

        for (const prop in data) {
            if (!data[prop]) delete data[prop];
        }
    }

    async getAll() {
        try {

            const categories = await CategoryModel.find({ deleted: false });
            this.setResponse({ docs: categories });

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async list({ page = 1, limit = 10 }) {
        try {

            if (limit > 50) {
                limit = 50;
            }

            const categories = await CategoryModel.paginate({ deleted: false }, { page: Number(page), limit: Number(limit), select: selectString });
            this.setResponse(categories);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async getById(id) {
        try {

            const categories = await CategoryModel.paginate({ id, deleted: false }, { select: selectString });

            if (!categories.docs.length) {
                this.setResponse({ message: 'Categories was not found!' }, 400);
                return this.response();
            }

            this.setResponse(categories.docs[0]);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async create(data) {
        try {

            const validCategories = this.validate(data, ['name', 'description']);

            if (validCategories.isInvalid) {
                return this.response();
            }

            const categories = await CategoryModel.find({ name: data.name });

            if (categories.length) {
                this.setResponse({ message: `Category '${data.name}' already exists` }, 400);
                return this.response();
            };

            formatRequest(data);
            const categoryCreated = await CategoryModel.create(data);
            this.setResponse(categoryCreated);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async update(id, data) {
        try {

            formatRequest(data);
            data.updated_at = new Date();
            let updatedCategory = await CategoryModel.findOneAndUpdate({ id }, data, { new: true });
            updatedCategory = await CategoryModel.findOne({ id });
            this.setResponse(updatedCategory);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async delete(id) {
        try {

            const deletedCategory = await CategoryModel.findOneAndUpdate({ id }, { deleted: true }, { new: true });
            this.setResponse(deletedCategory);

            await ProductModel.updateMany({ category: id }, { deleted: true });

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };
}

function formatRequest(data) {

    data.updated_at = undefined;
    data.created_at = undefined;
    data.deleted = undefined;
    data.id = undefined;

    for (const prop in data) {
        if (!data[prop]) delete data[prop];
    }
}

module.exports = Category;