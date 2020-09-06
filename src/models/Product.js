const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const ProductModel = mongoose.model('Product');

const selectString = '-_id -__v';

class Product {

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

    async getAll({ page = 1, limit = 10, category = null}) {
        try {

            let query = {};

            if(category) query = { category }

            const products = await ProductModel.paginate(query, { page, limit, select: selectString });
            this.setResponse(products);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async getById(id) {
        try {

            const product = await ProductModel.find({ id });
            this.setResponse(product);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async create(data) {
        try {

            const validProduct = this.validate(data, ['title', 'category', 'image']);
            if (validProduct.isInvalid) {
                return;
            }

            formatRequest(data);
            const productCreated = await ProductModel.create(data);
            this.setResponse(productCreated);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async update(id, data) {
        try {

            formatRequest(data, true);
            const updatedProduct = await ProductModel.findOneAndUpdate({ id }, data, { new: true });
            updatedProduct = await ProductModel.findById(id);
            this.setResponse(updatedProduct);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async delete(id) {
        try {

            const deletedProduct = await ProductModel.findOneAndDelete({ id });
            this.setResponse(deletedProduct);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };
}

function formatRequest(data, isUpdated = false) {
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

module.exports = Product;