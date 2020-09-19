require('../schemas/Product');
require('../schemas/Customer');
require('../schemas/Category');

const express = require('express');
const routes = express.Router();

const ProductController = require('../controllers/Products');

routes.get('/', ProductController.getAll);
routes.get('/:id', ProductController.getById);
routes.post('/', ProductController.create);
routes.put('/:id', ProductController.update);
routes.delete('/:id', ProductController.delete);

module.exports = routes;