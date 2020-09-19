const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const SkuModel = mongoose.model('Sku');

const selectString = '-_id -__v';

class Sku {

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

            const skus = await SkuModel.paginate({}, { page, limit, select: selectString });
            this.setResponse(skus);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async getById(id) {
        try {

            const sku = await SkuModel.find({ id });
            this.setResponse(sku);

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
            const skuCreated = await SkuModel.create(data);
            this.setResponse(skuCreated);

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
            const updatedSku = await SkuModel.findOneAndUpdate({ id }, data, { new: true });
            updatedSku = await SkuModel.findById(id);
            this.setResponse(updatedSku);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async delete(id) {
        try {

            const deletedProduct = await SkuModel.findOneAndDelete({ id });
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

module.exports = Sku;