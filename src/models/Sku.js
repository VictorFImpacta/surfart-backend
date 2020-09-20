const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const SkuModel = mongoose.model('Sku');
const ProductModel = mongoose.model('Product');

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
            this.setResponse(skus.docs);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async getById(id) {
        try {

            const sku = await SkuModel.findOne({ id });

            if (!sku) {
                this.setResponse({ message: 'Sku was not found!' }, 400);
                return this.response();
            }

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

            const validateArray = ['product_id', 'title', 'price', 'old_price', 'position', 'images', 'height', 'weight', 'quantity', 'images'];
            const validProduct = this.validate(data, validateArray);

            if (validProduct.isInvalid) {
                return this.response();
            }

            const product = await ProductModel.findOne({ id: data.product_id });

            if (!product) {
                this.setResponse({ message: 'Product was not found' }, 400);
                return this.response();
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

            if (!data.product_id) {
                this.setResponse({ message: 'The fields are missing: product_id' }, 400);
                return this.response();
            }

            const variant = await SkuModel.findOne({ id });

            if (!variant) {
                this.setResponse({ message: 'Sku was not found' }, 400);
                return this.response();
            }

            formatRequest(data, true);

            for (const prop in data) {
                variant[prop] = data[prop];
            };

            const skuUpdated = await SkuModel.findOneAndUpdate({ id }, variant, { new: true });
            this.setResponse(skuUpdated);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async delete(id) {
        try {

            const deletedSku = await SkuModel.findOneAndDelete({ id });
            this.setResponse(deletedSku);

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
    data.sku = undefined;
    data.created_at = undefined;

    if (isUpdated) {
        data.updated_at = undefined;
        data.product_id = undefined;
    }

    for (const prop in data) {
        if (!data[prop]) delete data[prop];
    }
}

module.exports = Sku;