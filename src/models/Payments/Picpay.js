const mongoose = require('mongoose');
const request = require('request');
mongoose.set('useFindAndModify', false);

const PicpayModel = mongoose.model('Picpay');
const PicpayRedirectModel = mongoose.model('PicpayRedirect');
const OrderModel = mongoose.model('Order');

const url = process.env.PICPAY;

class Picpay {

    constructor() {
        this.result = [];
        this.statusCode = 200;
    };

    setResponse(result, statusCode = 200) {
        this.result = result;
        this.statusCode = statusCode;
    }

    response() {
        return {
            result: this.result,
            statusCode: this.statusCode
        };
    }

    sendError(data) {
        const result = {
            message: `The fields are missing: ${data.join().replace(/\,/g, ', ')}`
        };
        data.isInvalid = true;
        this.setResponse(result, 400);
    }

    validateCreation(data) {

        const paymentRequiredFields = ['orderId'];

        const missing = new Array();

        paymentRequiredFields.forEach(item => { if (!data[item]) missing.push(item) });

        if (missing.length) {
            this.sendError(missing);
            return { isInvalid: true };
        }

        return data;
    }

    async list() {
        try {
            const savedRequest = await PicpayModel.find();
            this.setResponse(savedRequest)
        } catch (error) {
            this.setResponse({ error }, 500)
            return this.response();
        } finally {
            return this.response();
        }
    }

    async create(request) {
        let savedRequest;
        const data = request.body;

        try {
            const validRequest = this.validateCreation(data);

            if (validRequest.isInvalid) {
                return this.response();
            }

            const checkPaymentAlreadyCreated = await PicpayModel.findOne({ orderId: data.orderId });
            if (checkPaymentAlreadyCreated) {
                this.setResponse({ message: 'Payment already created for this order' }, 400);
                return this.response();
            }

            const order = await OrderModel.findOne({ id: data.orderId });

            catchCatty(data, request);
            // Pagamento criado
            savedRequest = await PicpayModel.create({ value: order.value, ...data });
            const paymentCreated = await postRequest(url, savedRequest);

            // Redirecionamento do pagamento criado
            const redirectCreated = await PicpayRedirectModel.create(paymentCreated);
            console.log('paymentCreated: ', redirectCreated);

            this.setResponse(redirectCreated);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
            await PicpayModel.findByIdAndRemove(savedRequest._id);
        } finally {
            return this.response();
        }
    };

    async cancel(id) {
        try {

            const getPaymentOrder = await PicpayRedirectModel.findById(id);
            const cancelUrl = `${url}/${getPaymentOrder.referenceId}/cancellations`;
            const cancelPayment = await postRequest(cancelUrl);
            cancelPayment.canceled = true;
            await PicpayRedirectModel.findByIdAndUpdate({ _id: id }, cancelPayment, { new: true });
            this.setResponse(cancelPayment);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async getById(id) {
        try {

            const getPaymentOrder = await PicpayRedirectModel.findById(id);
            const getUrl = `${url}/${getPaymentOrder.referenceId}/status`;
            const paymentStatus = await getRequest(getUrl);
            this.setResponse(JSON.parse(paymentStatus));

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };
}

function catchCatty(data, request) {
    const sevenDaysInMiliseconds = 24 * 60 * 60 * 1000 * 7 // 7 dias em milissegundos
    const todayInMiliseconds = new Date().getTime();
    data.expiresAt = new Date(sevenDaysInMiliseconds + todayInMiliseconds);
    data.referenceId = new Date().getTime();
    data.callbackUrl = undefined;
    data.returnUrl = undefined;

    const user = {
        first_name: request.user.first_name,
        last_name: request.user.last_name,
        email: request.user.email,
    }

    data.buyer = {...user, document: data.document, phone: data.customer.phone };
}

function postRequest(url, body) {
    return new Promise((resolve, reject) => {
        request.post({
            url,
            body,
            headers: {
                'x-picpay-token': process.env.PICPAY_TOKEN,
                'x-seller-token': process.env.SELLER_TOKEN
            },
            json: true
        }, (err, res, body) => {
            if (body.message && body.message == 'Transação já foi cancelada') {
                resolve(body);
            }
            if (!err && res.statusCode == 200) {
                resolve(body);
            }
            reject(err);
        });
    });
}

function getRequest(url) {
    return new Promise((resolve, reject) => {
        request({
            url,
            headers: {
                'x-picpay-token': process.env.PICPAY_TOKEN,
                'x-seller-token': process.env.SELLER_TOKEN
            },
        }, (err, res, body) => {
            if (!err && res.statusCode === 200) {
                resolve(body);
            }
            reject(err);
        });
    });
}

module.exports = Picpay;