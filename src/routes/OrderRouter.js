require('../schemas/Product');
require('../schemas/Customer');
require('../schemas/Order');

const AuthenticateMiddleware = require('../middlewares/auth');
const OrderController = require('../controllers/Orders');
const express = require('express');
const routes = express.Router();

routes.post('/freight', OrderController.freight);
routes.post('/740129c9-9073-4a78-8565-95ef30c1881f/callback', OrderController.callback);

// Rota autenticada
routes.use(AuthenticateMiddleware);
routes.get('/', OrderController.list);
routes.get('/consultFreight/:cep', OrderController.viacep);
routes.get('/:id', OrderController.getById);
routes.post('/', OrderController.create);
routes.put('/:id', OrderController.update);
routes.delete('/:id', OrderController.delete);
routes.get('/', OrderController.getAll);

routes.put('/status/separated/:id', OrderController.updateStatusToSeparated);
routes.put('/status/shipped/:id', OrderController.updateStatusToShipped);
routes.put('/status/finalized/:id', OrderController.updateStatusToFinalized);
routes.put('/status/canceled/:id', OrderController.updateStatusToCanceled);

module.exports = routes;