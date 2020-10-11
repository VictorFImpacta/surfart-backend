const Category = require('../models/Category');


module.exports = {
    async getAll(req, res) {
        const category = new Category();
        const result = await category.getAll();
        return res.status(result.statusCode).send(result.result);
    },
    async list(req, res) {
        const category = new Category();
        const result = await category.list(req.params);
        return res.status(result.statusCode).send(result.result);
    },
    async getById(req, res) {
        const category = new Category();
        const result = await category.getById(req.params.id);
        return res.status(result.statusCode).send(result.result);
    },
    async create(req, res) {
        //if (!req.admin) return denyAccess(res);
        const category = new Category();
        const result = await category.create(req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async update(req, res) {
        //if (!req.admin) return denyAccess(res);
        const category = new Category();
        const result = await category.update(req.params.id, req.body);
        return res.status(result.statusCode).send(result.result);
    },
    async delete(req, res) {
        //if (!req.admin) return denyAccess(res);
        const category = new Category();
        const result = await category.delete(req.params.id);
        return res.status(result.statusCode).send(result.result);
    }
};

function denyAccess(res) {
    return res.status(401).send({ message: 'You do not have access for this' });
}