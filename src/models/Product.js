const { query } = require('express');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const ProductModel = mongoose.model('Product');
const SkuModel = mongoose.model('Sku');
const CategoryModel = mongoose.model('Category');

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

    async getAll({ page = 1, limit = 10, category }) {
        try {

            if (limit > 50) {
                limit = 50;
            }

            const total = await ProductModel.find().count();

            const query = queryFormater({ page, limit, category });

            const products = await ProductModel.aggregate(query);

            const response = {
                docs: products,
                total,
                limit,
                page,
                pages: Math.round(total / limit)
            }

            this.setResponse(response);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async getById(id) {
        try {

            const product = await ProductModel.paginate({ id }, { select: selectString });

            if (!product.docs.length) {
                this.setResponse({ message: 'Product was not found!' }, 400);
                return this.response();
            }

            const variants = await SkuModel.find({ product_id: id });
            product.docs[0].variants = variants;

            this.setResponse(product.docs[0]);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async create(data) {
        try {

            const validProduct = this.validate(data, ['title', 'categories']);

            if (validProduct.isInvalid) {
                return this.response();
            }

            let categories = await CategoryModel.find({ id: data.categories });
            categories = categories.map(item => {
                return {
                    name: item.name,
                    description: item.description,
                    id: item.id,
                }
            });

            data.categories = categories;

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

            const product = await ProductModel.findOne({ id });

            if (!product) {
                this.setResponse({ message: 'Product was not found' }, 400);
                return this.response();
            }

            formatRequest(data, true);

            data.categories = await CategoryModel.find({ id: data.categories });

            for (const prop in data) {
                product[prop] = data[prop];
            };

            const updatedProduct = await ProductModel.findOneAndUpdate({ id }, product, { new: true });
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
    data.__v = undefined;
    data.created_at = undefined;
    data.updated_at = undefined;

    for (const prop in data) {
        if (!data[prop]) delete data[prop];
    }
}

function queryFormater({ page, limit, category }) {

    const query = [];

    if (category) {
        query.push({
            $match: {
                'categories.name': String(category)
            }
        });
    }

    query.push({
        $lookup: {
            from: 'skus',
            localField: 'id',
            foreignField: 'product_id',
            as: 'variants'
        }
    })

    if (page > 1) {
        query.push({
            $skip: limit * (page - 1)
        })
    }

    query.push({ $limit: Number(limit) });

    return query;
}

module.exports = Product;