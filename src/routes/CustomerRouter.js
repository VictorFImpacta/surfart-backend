require('../schemas/Product');
require('../schemas/Customer');
require('../schemas/Recovery');

const AuthenticateMiddleware = require('../middlewares/auth');
const CustomerController = require('../controllers/Customers');
const express = require('express');
const routes = express.Router();

routes.post('/', CustomerController.create);
routes.post('/auth', CustomerController.auth);
routes.post('/recovery', CustomerController.recovery);
routes.post('/recovery/:recovery_check', CustomerController.recoveryValidate);

// Rota autenticada
routes.use(AuthenticateMiddleware);
routes.post('/validate/auth', CustomerController.validateToken);
routes.post('/password', CustomerController.recoveryPassword);
routes.put('/password', CustomerController.updatePassword);
routes.get('/:id', CustomerController.getById);
routes.post('/:id/address', CustomerController.createAddress);
routes.put('/', CustomerController.update);
routes.delete('/:id', CustomerController.delete);
routes.get('/', CustomerController.getAll);

module.exports = routes;