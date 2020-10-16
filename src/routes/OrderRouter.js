require('../schemas/Product');
require('../schemas/Customer');
require('../schemas/Order');

const AuthenticateMiddleware = require('../middlewares/auth');
const OrderController = require('../controllers/Orders');
const express = require('express');
const routes = express.Router();

routes.post('/freight', OrderController.freight);

// Rota autenticada
routes.use(AuthenticateMiddleware);
routes.post('/callback', OrderController.callback);
routes.get('/', OrderController.getAll);
routes.post('/', OrderController.create);
routes.put('/:id', OrderController.update);
routes.delete('/:id', OrderController.delete);
routes.get('/:id', OrderController.getById);

module.exports = routes;