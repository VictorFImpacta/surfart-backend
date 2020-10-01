require('../schemas/Category');
require('../schemas/Order');
require('../schemas/Customer');
require('../schemas/Product');
require('../schemas/Sku');
require('../schemas/SubCategory');

const OrderController = require('../controllers/Orders');
const CategoryController = require('../controllers/Categories');
const CustomerController = require('../controllers/Customers');
const ProductController = require('../controllers/Products');
const SkuController = require('../controllers/Sku');
const SubCategoryController = require('../controllers/SubCategories');

const express = require('express');
const routes = express.Router();

routes.get('/categories', CategoryController.getAll);
routes.get('/orders', OrderController.getAll);
routes.get('/customers', CustomerController.getAll);
routes.get('/products', ProductController.getAll);
routes.get('/skus', SkuController.getAll);
routes.get('/subcategories', SubCategoryController.getAll);

module.exports = routes;