require('../schemas/Product');
require('../schemas/Customer');

const CustomerController = require('../controllers/Customers');

const express = require('express');
const routes = express.Router();

routes.get('/', CustomerController.getAll);
routes.get('/:id', CustomerController.getById);
routes.post('/', CustomerController.create);
routes.post('/auth', CustomerController.auth);
routes.post('/:id/address', CustomerController.createAddress);
routes.put('/:id', CustomerController.update);
routes.delete('/:id', CustomerController.delete);

module.exports = routes;