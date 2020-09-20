const Customer = require('../models/Customer');

module.exports = {
    async getAll(req, res) {
        const customer = new Customer();
        const result = await customer.getAll(req.params);
        return res.status(result.statusCode).send(result.result);
    },
    async getById(req, res) {
        const customer = new Customer();
        const result = await customer.getById(req.params.id);
        return res.status(result.statusCode).send(result.result);
    },
    async create(req, res) {
        const customer = new Customer();
        const result = await customer.create(req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async update(req, res) {
        const customer = new Customer();
        const result = await customer.update(req.params.id, req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async delete(req, res) {
        const customer = new Customer();
        const result = await customer.delete(req.params.id);
        return res.status(result.statusCode).send(result.result);
    },
    async createAddress(req, res) {
        const customer = new Customer();
        const result = await customer.createAddress(req.params.id, req.body);
        return res.status(result.statusCode).send(result.result);
    }
};