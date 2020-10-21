const Juno = require('../../models/Payments/Juno');

module.exports = {
    async webhook(req, res) {
        const juno = new Juno();
        const result = await juno.webhook(req);
        return res.status(result.statusCode).send(result.result);
    },
    async list(req, res) {
        const juno = new Juno();
        const result = await juno.list();
        return res.status(result.statusCode).send(result.result);
    },
    async create(req, res) {
        const juno = new Juno();
        const result = await juno.create(req);
        return res.status(result.statusCode).send(result.result);
    },
    async cancel(req, res) {
        const juno = new Juno();
        const result = await juno.cancel(req.params.id);
        return res.status(result.statusCode).send(result.result);
    },
    async getById(req, res) {
        const juno = new Juno();
        const result = await juno.getById(req.params.id);
        return res.status(result.statusCode).send(result.result);
    }
};