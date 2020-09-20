require('../schemas/Product');
require('../schemas/Sku');

const express = require('express');
const routes = express.Router();

const SkuController = require('../controllers/Sku');

routes.get('/', SkuController.getAll);
routes.get('/:id', SkuController.getById);
routes.post('/', SkuController.create);
routes.put('/:id', SkuController.update);
routes.delete('/:id', SkuController.delete);

module.exports = routes;