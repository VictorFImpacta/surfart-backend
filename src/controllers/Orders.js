const Order = require('../models/Order');;

module.exports = {
    async getAll(req, res) {
        const order = new Order();
        const result = await order.getAll(req.query);
        return res.status(result.statusCode).send(result.result);
    },
    async getById(req, res) {
        const order = new Order();
        const result = await order.getById(req.params.id);
        return res.status(result.statusCode).send(result.result);
    },
    async create(req, res) {
        const order = new Order();
        const result = await order.create(req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async update(req, res) {
        const order = new Order();
        const result = await order.update(req.params.id, req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async delete(req, res) {
        const order = new Order();
        const result = await order.delete(req.params.id);
        return res.status(result.statusCode).send(result.result);
    },
    async createAddress(req, res) {
        const order = new Order();
        const result = await order.createAddress(req.params.id, req.body);
        return res.status(result.statusCode).send(result.result);
    }
};