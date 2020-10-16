require('../schemas/Product');
require('../schemas/Customer');
require('../schemas/Order');

const AuthenticateMiddleware = require('../middlewares/auth');
const OrderController = require('../controllers/Orders');
const express = require('express');
const routes = express.Router();

routes.post('/freight', OrderController.freight);

// Rota autenticada
// routes.use(AuthenticateMiddleware);
routes.get('/', OrderController.getAll);
routes.get('/', OrderController.list);
routes.get('/:id', OrderController.getById);
routes.post('/callback', OrderController.callback);
routes.post('/', OrderController.create);
routes.put('/:id', OrderController.update);
routes.delete('/:id', OrderController.delete);

routes.put('/status/paid/:id', OrderController.updateStatusToPaid);
routes.put('/status/separated/:id', OrderController.updateStatusToSeparated);

module.exports = routes;