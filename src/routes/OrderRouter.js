require('../schemas/Product');
require('../schemas/Customer');
require('../schemas/Order');

const OrderController = require('../controllers/Orders');

const express = require('express');
const routes = express.Router();

routes.get('/', OrderController.getAll);
routes.get('/:id', OrderController.getById);
routes.post('/', OrderController.create);
routes.put('/:id', OrderController.update);
routes.delete('/:id', OrderController.delete);

module.exports = routes;