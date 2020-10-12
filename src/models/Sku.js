require('dotenv').config()

const fs = require('fs');
const AWS = require('aws-sdk');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});

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

    async getAll() {
        try {

            const skus = await SkuModel.find({ deleted: false });
            this.setResponse({ docs: skus });

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

            const skus = await SkuModel.paginate({ deleted: false }, { page: Number(page), limit: Number(limit), select: selectString });
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

            const sku = await SkuModel.paginate({ id, deleted: false }, { select: selectString });

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

            const validateArray = ['product_id', 'availableStock', 'title', 'price', 'old_price',
                'images', 'height', 'weight', 'quantity', 'size', 'color'
            ];
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
            return this.response()
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
            data.updated_at = new Date();

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

            const deletedSku = await SkuModel.findOneAndUpdate({ id }, { deleted: true }, { new: true });
            this.setResponse(deletedSku);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async decreaseAvailableStock(id, data) {
        try {

            const incomingQuantity = data.quantity;

            const { availableStock } = await SkuModel.findOne({ id });

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

    async increaseAvailableStock(id, data) {
        try {

            const incomingQuantity = data.quantity;
            const { availableStock } = await SkuModel.findOne({ id });
            const { quantity } = await SkuModel.findOne({ id });

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

    async decreaseRealStock(id, data) {
        try {

            const incomingQuantity = data.quantity;

            const { availableStock, quantity } = await SkuModel.findOne({ id });

            const newStock = quantity - incomingQuantity;

            if (newStock < availableStock) {
                this.setResponse({ message: 'A operação irá deixar o estoque disponível maior do que o estoque real' });
                return this.response();
            }

            await SkuModel.findOneAndUpdate({ id }, { quantity: newStock });

            this.setResponse({ message: 'Estoque real atualizado' }, 200);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    }

    async increaseRealStock(id, data) {
        try {

            const incomingQuantity = data.quantity;

            const { quantity } = await SkuModel.findOne({ id });

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

    async uploadImage(files) {
        try {

            if (!files || !files.image) {
                this.setResponse({ message: 'Please, send a file' }, 400);
                return this.response();
            }

            const image = fs.readFileSync(files.image.path);
            const Key = files.image.originalFilename;
            const Body = Buffer.from(image);

            const params = { Bucket: 'surfart', Key, Body };

            const upload = await new Promise((resolve, reject) => {
                s3.upload(params, (err, data) => {
                    if (err) {
                        reject(err)
                    }
                    console.log(data)
                    resolve(data)
                });
            });

            const response = {
                Location: upload.Location,
                Key: upload.Key
            }

            this.setResponse(response, 200);

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
    data.updated_at = undefined;
    data.created_at = undefined;
    data.deleted = undefined;

    if (isUpdated) {
        data.product_id = undefined;
        data.quantity = undefined;
        data.availableStock = undefined;
    }

    for (const prop in data) {
        if (!data[prop]) delete data[prop];
    }
}

module.exports = Sku;