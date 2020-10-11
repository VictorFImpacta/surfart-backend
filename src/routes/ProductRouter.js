require('../schemas/Product');
require('../schemas/Category');
require('../schemas/Sku');
require('../schemas/Customer');

const AuthenticateMiddleware = require('../middlewares/auth');
const ProductController = require('../controllers/Products');
const express = require('express');
const routes = express.Router();

routes.get('/', ProductController.getAll);
routes.get('/', ProductController.list);
routes.get('/:id', ProductController.getById);

// Rota autenticada
// routes.use(AuthenticateMiddleware);
routes.post('/', ProductController.create);
routes.put('/:id', ProductController.update);
routes.delete('/:id', ProductController.delete);

module.exports = routes;