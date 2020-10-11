require('../schemas/Category');
require('../schemas/Order');
require('../schemas/Customer');
require('../schemas/Product');
require('../schemas/Sku');

const AuthenticateMiddleware = require('../middlewares/auth');
const OrderController = require('../controllers/Orders');
const CategoryController = require('../controllers/Categories');
const CustomerController = require('../controllers/Customers');
const ProductController = require('../controllers/Products');
const SkuController = require('../controllers/Sku');

const express = require('express');
const routes = express.Router();

routes.get('/categories', CategoryController.getAll);
routes.get('/products', ProductController.getAll);
routes.get('/skus', SkuController.getAll);

// Rota autenticada
// routes.use(AuthenticateMiddleware);
routes.get('/orders', OrderController.getAll);
routes.get('/customers', CustomerController.getAll);

module.exports = routes;