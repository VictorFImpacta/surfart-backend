const Sku = require('../models/Sku');

module.exports = {
    async getAll(req, res) {
        const sku = new Sku();
        const result = await sku.getAll(req.query);
        return res.status(result.statusCode).send(result.result);
    },
    async getById(req, res) {
        const sku = new Sku();
        const result = await sku.getById(req.params.id);
        return res.status(result.statusCode).send(result.result);
    },
    async create(req, res) {
        const sku = new Sku();
        const result = await sku.create(req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async update(req, res) {
        const sku = new Sku();
        const result = await sku.update(req.params.id, req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async delete(req, res) {
        const sku = new Sku();
        const result = await sku.delete(req.params.id);
        return res.status(result.statusCode).send(result.result);
    },
    async decreaseAvailableStock(req, res) {
        const sku = new Sku();
        const result = await sku.decreaseAvailableStock(req.params.id, req.body.quantity);
        return res.status(result.statusCode).send(result.result);
    },
    async increaseAvailableStock(req, res) {
        const sku = new Sku();
        const result = await sku.increaseAvailableStock(req.params.id, req.body.quantity);
        return res.status(result.statusCode).send(result.result);
    },
    async decreaseRealStock(req, res) {
        const sku = new Sku();
        const result = await sku.decreaseRealStock(req.params.id, req.body.quantity);
        return res.status(result.statusCode).send(result.result);
    },
    async increaseRealStock(req, res) {
        const sku = new Sku();
        const result = await sku.increaseRealStock(req.params.id, req.body.quantity);
        return res.status(result.statusCode).send(result.result);
    }
};