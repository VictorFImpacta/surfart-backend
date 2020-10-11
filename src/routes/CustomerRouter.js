require('../schemas/Product');
require('../schemas/Customer');

const AuthenticateMiddleware = require('../middlewares/auth');
const CustomerController = require('../controllers/Customers');
const express = require('express');
const routes = express.Router();

routes.post('/', CustomerController.create);
routes.post('/auth', CustomerController.auth);

// Rota autenticada
// routes.use(AuthenticateMiddleware);
routes.get('/:id', CustomerController.getById);
routes.post('/:id/address', CustomerController.createAddress);
routes.put('/:id', CustomerController.update);
routes.delete('/:id', CustomerController.delete);
routes.get('/', CustomerController.getAll);

module.exports = routes;