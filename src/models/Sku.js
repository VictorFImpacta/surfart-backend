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

            if (limit > 50) {
                limit = 50;
            }

            const skus = await SkuModel.paginate({}, { page: Number(page), limit: Number(limit), select: selectString });
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

            const sku = await SkuModel.paginate({ id }, { select: selectString });

            if (!sku.docs.length) {
                this.setResponse({ message: 'Sku was not found!' }, 400);
                return this.response();
            }

            this.setResponse(sku.docs[0]);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async create(data) {
        try {

            const validateArray = ['product_id', 'title', 'price', 'old_price', 'images', 'height', 'weight', 'quantity', 'images'];
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

    async decreaseAvailableStock(id, incomingQuantity) {
        try {

            let { availableStock } = await SkuModel.findOne({ id });

            const newStock = availableStock - incomingQuantity;

            if (newStock < 0) {
                this.setResponse({ message: 'A operação irá deixar o estoque disponível negativo' }, 400);
                return this.response();
            }

            await SkuModel.findOneAndUpdate({ id }, { availableStock: newStock });

            this.setResponse({ message: 'Estoque disponível atualizado' }, 200);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    }

    async increaseAvailableStock(id, incomingQuantity) {
        try {

            let { availableStock } = await SkuModel.findOne({ id });
            let { quantity } = await SkuModel.findOne({ id });

            const newStock = availableStock + incomingQuantity;

            if (newStock > quantity) {
                this.setResponse({ message: 'A operação irá deixar o estoque disponível maior do que o estoque real' }, 400);
                return this.response();
            }

            await SkuModel.findOneAndUpdate({ id }, { availableStock: newStock });

            this.setResponse({ message: 'Estoque disponível atualizado' }, 200);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    }

    async decreaseRealStock(id, incomingQuantity) {
        try {

            let { quantity } = await SkuModel.findOne({ id });

            const newStock = quantity - incomingQuantity;

            await SkuModel.findOneAndUpdate({ id }, { quantity: newStock });

            this.setResponse({ message: 'Estoque real atualizado' }, 200);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    }

    async increaseRealStock(id, incomingQuantity) {
        try {

            let { quantity } = await SkuModel.findOne({ id });

            const newStock = quantity + incomingQuantity;

            await SkuModel.findOneAndUpdate({ id }, { quantity: newStock });

            this.setResponse({ message: 'Estoque real atualizado' }, 200);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    }

}

function formatRequest(data, isUpdated = false) {

    data.id = undefined;
    data.sku = undefined;
    data.created_at = undefined;
    if (isUpdated) {
        data.product_id = undefined;
    }

    for (const prop in data) {
        if (!data[prop]) delete data[prop];
    }
}

module.exports = Sku;