require('../schemas/Category');

const CategoryController = require('../controllers/Categories');

const express = require('express');
const routes = express.Router();

routes.get('/', CategoryController.getAll);
routes.get('/:id', CategoryController.getById);
routes.post('/', CategoryController.create);
routes.put('/:id', CategoryController.update);
routes.delete('/:id', CategoryController.delete);

module.exports = routes;