const Customer = require('../models/Customer');

module.exports = {
    async getAll(req, res) {
        if (!req.user.admin) return denyAccess(res);
        const customer = new Customer();
        const result = await customer.getAll(req.params);
        return res.status(result.statusCode).send(result.result);
    },
    async list(req, res) {
        if (!req.user.admin) return denyAccess(res);
        const customer = new Customer();
        const result = await customer.list(req.params);
        return res.status(result.statusCode).send(result.result);
    },
    async getById(req, res) {
        if (req.params.id != req.user.id && !req.user.admin) return denyAccess(res);
        const customer = new Customer();
        const result = await customer.getById(req.params.id);
        return res.status(result.statusCode).send(result.result);
    },
    async recoveryPassword(req, res) {
        if (req.params.id != req.user.id) return denyAccess(res);
        const customer = new Customer();
        const result = await customer.recoveryPassword(req);
        return res.status(result.statusCode).send(result.result);
    },
    async updatePassword(req, res) {
        const customer = new Customer();
        const result = await customer.updatePassword(req);
        return res.status(result.statusCode).send(result.result);
    },
    async validateToken(req, res) {
        const customer = new Customer();
        const result = await customer.validateToken(req);
        return res.status(result.statusCode).send(result.result);
    },
    async recovery(req, res) {
        const customer = new Customer();
        const result = await customer.recovery(req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async recoveryValidate(req, res) {
        const customer = new Customer();
        const result = await customer.recoveryValidate(req);
        return res.status(result.statusCode).send(result.result);
    },
    async auth(req, res) {
        const customer = new Customer();
        const result = await customer.auth(req);
        return res.status(result.statusCode).send(result.result);
    },
    async create(req, res) {
        const customer = new Customer();
        const result = await customer.create(req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async update(req, res) {
        const customer = new Customer();
        const result = await customer.update(req);
        return res.status(result.statusCode).send(result.result);
    },
    async delete(req, res) {
        if (req.params.id != req.user.id) return denyAccess(res);
        const customer = new Customer();
        const result = await customer.delete(req.params.id);
        return res.status(result.statusCode).send(result.result);
    },
    async createAddress(req, res) {
        if (req.params.id != req.user.id) return denyAccess(res);
        const customer = new Customer();
        const result = await customer.createAddress(req.params.id, req.body);
        return res.status(result.statusCode).send(result.result);
    }
};

function denyAccess(res) {
    return res.status(401).send({ message: 'You do not have access for this' });
}