const Product = require('../models/Product');

module.exports = {
    async getAll(req, res) {
        const product = new Product();
        const result = await product.getAll(req.query);
        return res.status(result.statusCode).send(result.result);
    },
    async getAllWithoutPagination(req, res) {
        const product = new Product();
        const result = await product.getAllWithoutPagination(req.query);
        return res.status(result.statusCode).send(result.result);
    },
    async getById(req, res) {
        const product = new Product();
        const result = await product.getById(req.params.id);
        return res.status(result.statusCode).send(result.result);
    },
    async create(req, res) {
        const product = new Product();
        const result = await product.create(req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async update(req, res) {
        const product = new Product();
        const result = await product.update(req.params.id, req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async delete(req, res) {
        const product = new Product();
        const result = await product.delete(req.params.id);
        return res.status(result.statusCode).send(result.result);
    }
};