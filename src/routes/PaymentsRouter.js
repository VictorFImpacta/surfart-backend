require('../schemas/Payments/Picpay/PicpayOrder');
require('../schemas/Payments/Picpay/PicpayRedirect');

const PaymentController = require('../controllers/Payments/Picpay');

const express = require('express');
const routes = express.Router();

// PicPay
routes.post('/picpay', PaymentController.create);
routes.post('/picpay/:id/cancel', PaymentController.cancel);
routes.get('/picpay/:id', PaymentController.getById);

module.exports = routes;