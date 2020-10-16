require('../schemas/Category');
require('../schemas/Customer');

const AuthenticateMiddleware = require('../middlewares/auth');
const CategoryController = require('../controllers/Categories');
const express = require('express');
const routes = express.Router();

routes.get('/', CategoryController.list);
routes.get('/:id', CategoryController.getById);

// Rota autenticada
// routes.use(AuthenticateMiddleware);
routes.post('/', CategoryController.create);
routes.put('/:id', CategoryController.update);
routes.delete('/:id', CategoryController.delete);

module.exports = routes;