const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const CategoryModel = mongoose.model('Category');

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

    async getAll({ page = 1, limit = 10 }) {
        try {

            const categories = await CategoryModel.paginate({}, { page, limit, select: selectString });
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

            const categories = await CategoryModel.find({ id });
            this.setResponse(categories);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async create(data) {
        try {

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
            const updatedCategory = await CategoryModel.findOneAndUpdate({ id }, data, { new: true });
            updatedCategory = await CategoryModel.findById(id);
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

            const deletedCategory = await CategoryModel.findOneAndDelete({ id });
            this.setResponse(deletedCategory);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };
}

function formatRequest(data) {
    data.id = undefined;

    for (const prop in data) {
        if (!data[prop]) delete data[prop];
    }
}

module.exports = Category;