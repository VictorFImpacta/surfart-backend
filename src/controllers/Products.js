const Product = require('../models/Product');

module.exports = {
    async getAll(req, res) {
        const product = new Product();
        const result = await product.getAll(req.query);
        return res.status(result.statusCode).send(result.result);
    },
    async list(req, res) {
        const product = new Product();
        const result = await product.list(req.query);
        return res.status(result.statusCode).send(result.result);
    },
    async getById(req, res) {
        const product = new Product();
        const result = await product.getById(req.params.id);
        return res.status(result.statusCode).send(result.result);
    },
    async create(req, res) {
        if (!req.user.admin) return denyAccess(res);
        const product = new Product();
        const result = await product.create(req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async update(req, res) {
        if (!req.user.admin) return denyAccess(res);
        const product = new Product();
        const result = await product.update(req.params.id, req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async delete(req, res) {
        if (!req.user.admin) return denyAccess(res);
        const product = new Product();
        const result = await product.delete(req.params.id);
        return res.status(result.statusCode).send(result.result);
    }
};

function denyAccess(res) {
    return res.status(401).send({ message: 'You do not have access for this' });
}