require('../schemas/SubCategory');
require('../schemas/Category');

const SubCategoryController = require('../controllers/SubCategories');

const express = require('express');
const routes = express.Router();

routes.get('/', SubCategoryController.getAll);
routes.get('/:id', SubCategoryController.getById);
routes.post('/', SubCategoryController.create);
routes.put('/:id', SubCategoryController.update);
routes.delete('/:id', SubCategoryController.delete);

module.exports = routes;