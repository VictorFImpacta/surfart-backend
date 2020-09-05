const Category = require('../models/Category');

module.exports = {
    async getAll(req, res) {
        const category = new Category();
        const result = await category.getAll(req.query);
        return res.status(result.statusCode).send(result.result);
    },
    async getById(req, res) {
        const category = new Category();
        const result = await category.getById(req.params.id);
        return res.status(result.statusCode).send(result.result);
    },
    async create(req, res) {
        const category = new Category();
        const result = await category.create(req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async update(req, res) {
        const category = new Category();
        const result = await category.update(req.params.id, req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async delete(req, res) {
        const category = new Category();
        const result = await category.delete(req.params.id);
        return res.status(result.statusCode).send(result.result);
    },
    async createAddress(req, res) {
        const category = new Category();
        const result = await category.createAddress(req.params.id, req.body);
        return res.status(result.statusCode).send(result.result);
    }
};