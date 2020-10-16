const Order = require('../models/Order');;

module.exports = {
    async getAll(req, res) {
        // if (!req.user.admin) return denyAccess(res);
        const order = new Order();
        const result = await order.getAll(req);
        return res.status(result.statusCode).send(result.result);
    },
    async freight(req, res) {
        const order = new Order();
        const result = await order.freight(req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async callback(req, res) {
        const order = new Order();
        const result = await order.callback(req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async list(req, res) {
        const order = new Order();
        const result = await order.list(req);
        return res.status(result.statusCode).send(result.result);
    },
    async getById(req, res) {
        const order = new Order();
        const result = await order.getById(req);
        return res.status(result.statusCode).send(result.result);
    },
    async create(req, res) {
        const order = new Order();
        const result = await order.create(req);
        return res.status(result.statusCode).send(result.result);
    },
    async update(req, res) {
        const order = new Order();
        const result = await order.update(req);
        return res.status(result.statusCode).send(result.result);
    },
    async delete(req, res) {
        if (!req.user.admin) return denyAccess(res);
        const order = new Order();
        const result = await order.delete(req.params.id);
        return res.status(result.statusCode).send(result.result);
    },
    async createAddress(req, res) {
        const order = new Order();
        const result = await order.createAddress(req.params.id, req.body);
        return res.status(result.statusCode).send(result.result);
    },
    // async updateStatusToPaid(req, res) {
    //     const order = new Order();
    //     const result = await order.updateStatusToPaid(req.params.id);
    //     return res.status(result.statusCode).send(result.result);
    // },
    async updateStatusToSeparated(req, res) {
        const order = new Order();
        const result = await order.updateStatusToPaid(req.params.id);
        return res.status(result.statusCode).send(result.result);
    }
};

function denyAccess(res) {
    return res.status(401).send({ message: 'You do not have access for this' });
}