require('../schemas/Product');
require('../schemas/Customer');
require('../schemas/Order');

const OrderController = require('../controllers/Orders');
const CategoryController = require('../controllers/Categories');
const CustomerController = require('../controllers/Customers');
const ProductController = require('../controllers/Products');
const SkuController = require('../controllers/Sku');

const express = require('express');
const routes = express.Router();

routes.get('/categories', CategoryController.getAll);
routes.get('/orders', OrderController.getAll);
routes.get('/customers', CustomerController.getAll);
routes.get('/products', ProductController.getAll);
routes.get('/skus', SkuController.getAll);

module.exports = routes;