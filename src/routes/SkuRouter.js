require('../schemas/Product');
require('../schemas/Sku');

const express = require('express');
const routes = express.Router();

const SkuController = require('../controllers/Sku');

// Sku Routes
routes.get('/', SkuController.getAll);
routes.get('/:id', SkuController.getById);
routes.post('/', SkuController.create);
routes.put('/:id', SkuController.update);
routes.delete('/:id', SkuController.delete);

// pedir ajuda para pensar em uma rota melhor
routes.put('/stock/available/decrease/:id', SkuController.decreaseAvailableStock);
routes.put('/stock/available/increase/:id', SkuController.increaseAvailableStock);
routes.put('/stock/real/decrease/:id', SkuController.decreaseRealStock);
routes.put('/stock/real/increase/:id', SkuController.increaseRealStock);

module.exports = routes;