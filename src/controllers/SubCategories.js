const SubCategory = require('../models/SubCategory');

module.exports = {
    async getAll(req, res) {
        const subCategory = new SubCategory();
        const result = await subCategory.getAll(req.params);
        return res.status(result.statusCode).send(result.result);
    },
    async getById(req, res) {
        const subCategory = new SubCategory();
        const result = await subCategory.getById(req.params.id);
        return res.status(result.statusCode).send(result.result);
    },
    async create(req, res) {
        const subCategory = new SubCategory();
        const result = await subCategory.create(req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async update(req, res) {
        const subCategory = new SubCategory();
        const result = await subCategory.update(req.params.id, req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async delete(req, res) {
        const subCategory = new SubCategory();
        const result = await subCategory.delete(req.params.id);
        return res.status(result.statusCode).send(result.result);
    }
};