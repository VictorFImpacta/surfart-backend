require('../schemas/Payments/Picpay/PicpayOrder');
require('../schemas/Payments/Picpay/PicpayRedirect');
require('../schemas/Payments/Juno/JunoOrder');
require('../schemas/Payments/Juno/JunoRedirect');
require('../schemas/Order');

const AuthenticateMiddleware = require('../middlewares/auth');
const Picpay_PaymentController = require('../controllers/Payments/Picpay');
const Juno_PaymentController = require('../controllers/Payments/Juno');

const express = require('express');
const routes = express.Router();

// PicPay
routes.use(AuthenticateMiddleware);
routes.get('/picpay', Picpay_PaymentController.list);
routes.post('/picpay', Picpay_PaymentController.create);
routes.post('/picpay/:id/cancel', Picpay_PaymentController.cancel);
routes.get('/picpay/:id', Picpay_PaymentController.getById);

routes.get('/juno', Juno_PaymentController.list);
routes.post('/juno/webhook', Juno_PaymentController.webhook);
routes.post('/juno', Juno_PaymentController.create);
routes.post('/juno/:id/cancel', Juno_PaymentController.cancel);
routes.get('/juno/:id', Juno_PaymentController.getById);

module.exports = routes;