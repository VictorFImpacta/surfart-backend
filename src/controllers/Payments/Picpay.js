const Picpay = require('../../models/Payments/Picpay');

module.exports = {
    async list(req, res) {
        const picpay = new Picpay();
        const result = await picpay.list();
        return res.status(result.statusCode).send(result.result);
    },
    async create(req, res) {
        const picpay = new Picpay();
        const result = await picpay.create(req);
        return res.status(result.statusCode).send(result.result);
    },
    async cancel(req, res) {
        const picpay = new Picpay();
        const result = await picpay.cancel(req.params.id);
        return res.status(result.statusCode).send(result.result);
    },
    async getById(req, res) {
        const picpay = new Picpay();
        const result = await picpay.getById(req.params.id);
        return res.status(result.statusCode).send(result.result);
    }
};