require('../schemas/Product');
require('../schemas/Sku');
require('../schemas/Customer');

const AuthenticateMiddleware = require('../middlewares/auth');
const SkuController = require('../controllers/Sku');
const express = require('express');
const routes = express.Router();

routes.get('/', SkuController.getAll);
routes.get('/:id', SkuController.getById);
routes.put('/stock/available/decrease/:id', SkuController.decreaseAvailableStock);
routes.put('/stock/available/increase/:id', SkuController.increaseAvailableStock);

//Rota autenticada
routes.use(AuthenticateMiddleware);
routes.post('/', SkuController.create);
routes.post('/image', SkuController.uploadImage);
routes.put('/:id', SkuController.update);
routes.delete('/:id', SkuController.delete);

// Stocks
routes.put('/stock/real/decrease/:id', SkuController.decreaseRealStock);
routes.put('/stock/real/increase/:id', SkuController.increaseRealStock);

module.exports = routes;