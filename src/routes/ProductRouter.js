require('../schemas/Product');
require('../schemas/Category');
require('../schemas/Sku');

const express = require('express');
const routes = express.Router();
const ProductController = require('../controllers/Products');

// Product Routes
routes.get('/', ProductController.getAll);
routes.get('/', ProductController.list);
routes.get('/:id', ProductController.getById);
routes.post('/', ProductController.create);
routes.put('/:id', ProductController.update);
routes.delete('/:id', ProductController.delete);

module.exports = routes;