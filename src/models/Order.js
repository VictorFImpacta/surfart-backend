require('dotenv').config()

const sendEmail = require('../services/notifications/sendNotification');
const template = require('../services/notifications/notification-template');
const request = require('request');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const OrderModel = mongoose.model('Order');
const PicpayModel = mongoose.model('Picpay');
const CustomerModel = mongoose.model('Customer');
const SkuModel = mongoose.model('Sku');
const SkuAppModel = require('../models/Sku');
const skuAppModel = new SkuAppModel();

const selectString = '-_id -__v';

class Order {

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

    validate(data, validateArray) {
        const missing = new Array();
        validateArray.forEach(item => {
            if (!data[item]) missing.push(item);
        });
        if (missing.length) {
            const result = {
                message: `The fields are missing: ${missing.join().replace(/\,/g, ', ')}`
            };
            data.isInvalid = true;
            this.setResponse(result, 400);
        }
        return data;
    }

    async getAll(request) {
        try {

            if (request.user && request.user.admin) {
                const orders = await OrderModel.find();
                this.setResponse(orders);
                return this.response();
            }

            const query = [{
                $match: {
                    'deleted': false,
                    'customer.id': request.user.id
                }
            }];

            const orders = await OrderModel.aggregate(query);
            this.setResponse({ docs: orders });

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async list(request) {
        try {

            const { page = 1, limit = 10 } = request.query;

            if (limit > 50) {
                limit = 50;
            }

            const orders = await OrderModel.find({ deleted: false, 'customer.id': request.user.id });

            this.setResponse(orders);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async getById(request) {
        try {

            // const id = request.params.id;
            // let order = await OrderModel.find({ id, 'customer.customer_id': request.user_id, deleted: false })

            // if (request.admin) {
            const order = await OrderModel.findOne({ id: request.params.id });
            // }

            // if (!order.length) {
            //     this.setResponse({ message: 'Order was not found!' }, 400);
            //     return this.response();
            // }

            this.setResponse(order);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async create(request) {
        try {

            const body = request.body;

            if (!body.items || !body.items.length) {
                this.setResponse({ message: 'The fields are missing: items' }, 400)
                return this.response();
            }

            const itemsValidate = await this.validateItems(body);

            if (itemsValidate.isInvalid) {
                return this.response();
            }

            body.value = 0;

            for (const item of body.items) {
                body.value += item.item.price * item.quantity;
            }

            body.customer = request.user;

            clearCustomer(body);
            formatRequest(body);

            if (!body.billing_address) body.billing_address = body.customer.addresses[0];

            const orderCreated = await OrderModel.create(body);
            this.setResponse(orderCreated);
            await sendEmail(request.user.email, `Pedido ${orderCreated.id} criado com sucesso!`, template.created_order());

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async update(request) {
        try {

            const id = request.params.id;
            const data = request.body;

            let order = await OrderModel.findOne({ id, 'customer.customer_id': request._id, deleted: false });

            if (request.admin) {
                order = await OrderModel.findOne({ id });
            }

            if (!order) {
                this.setResponse({ message: 'Order was not found' }, 400);
                return this.response();
            }

            formatRequest(data, true);

            for (const prop in data) {
                order[prop] = order[prop];
            };
            data.updated_at = new Date();

            const updatedCategory = await OrderModel.findOneAndUpdate({ id }, order, { new: true });
            this.setResponse(updatedCategory);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async delete(id) {
        try {

            const deletedCategory = await OrderModel.findOneAndUpdate({ id }, { deleted: true }, { new: true });
            this.setResponse(deletedCategory);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async callback(data) {

        try {

            let { orderId } = await PicpayModel.findOne({ referenceId: data.referenceId });

            const order = await OrderModel.findOne({ id: orderId });

            if (order && order.status != 'OPEN') {
                this.setResponse({ message: `You cannot update the order status to paid from the current status` }, 400);
                return this.response();
            }

            const updatedOrder = await OrderModel.findOneAndUpdate({ id: order.id }, { status: 'PAID' }, { new: true });
            this.setResponse(updatedOrder);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    }

    async viaCep(cep) {
        try {
            const url = `https://viacep.com.br/ws/${cep}/json/`;
            let response = await make_request(url);

            if (response.error) {
                this.setResponse({ message: 'invalid Cep' }, 400);
                return this.response();
            }

            this.setResponse(response.body);
        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    }

    async freight(data) {
        try {

            const validate = this.validate(data, ['postalCode', 'weight',
                'length', 'height', 'width', 'value'
            ]);

            if (validate.isInvalid) {
                return this.response();
            }

            /*
            04014 SEDEX à vista
            04510 PAC à vista
            */

            const sedex = formatFreight({ ...data, serviceCode: '04014' });
            const pac = formatFreight({ ...data, serviceCode: '04510' });
            let sedexResponse = await make_request(sedex);
            let pacResponse = await make_request(pac);
            sedexResponse = xmlToJson(sedexResponse.body);
            pacResponse = xmlToJson(pacResponse.body);

            if (sedexResponse.estimated_arrival == "0") {
                this.setResponse({ message: 'An error has ocurred. Please, check all fields and try again.' }, 400);
                return this.response();
            }

            const response = [{ ...sedexResponse, service: 'Sedex' }, { ...pacResponse, service: 'Pac' }];
            this.setResponse(response);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async updateStatusToSeparated(id) {

        try {

            const order = await OrderModel.findOne({ id });

            if (order.status != 'PAID') {
                this.setResponse({ message: `You cannot update the order status to separated from the current status` }, 400);
                return this.response();
            }

            const updatedOrder = await OrderModel.findOneAndUpdate({ id }, { status: 'SEPARATED' }, { new: true });

            const orderItems = updatedOrder.items.map(sku => {
                return { id: sku.item.id, quantity: sku.quantity }
            })

            for (const orderItem of orderItems) {

                await skuAppModel.decreaseRealStock(orderItem.id, { quantity: orderItem.quantity })
            }

            this.setResponse(updatedOrder);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async updateStatusToShipped(id) {

        try {

            const order = await OrderModel.findOne({ id });

            if (order.status != 'SEPARATED') {
                this.setResponse({ message: `You cannot update the order status to shipped from the current status` }, 400);
                return this.response();
            }

            const updatedOrder = await OrderModel.findOneAndUpdate({ id }, { status: 'SHIPPED' }, { new: true });
            this.setResponse(updatedOrder);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async updateStatusToFinalized(id) {

        try {

            const order = await OrderModel.findOne({ id });

            if (order.status != 'SHIPPED') {
                this.setResponse({ message: `You cannot update the order status to finalized from the current status` }, 400);
                return this.response();
            }

            const updatedOrder = await OrderModel.findOneAndUpdate({ id }, { status: 'FINALIZED' }, { new: true });
            this.setResponse(updatedOrder);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async updateStatusToCanceled(request) {

        try {

            const order = await OrderModel.findOne({ id: request.params.id });

            if (request.user.admin) {

                if (order.status == 'SEPARATED') {
                    // Voltar as quantidades para o estoque

                    const orderItems = order.items.map(sku => {
                        return { id: sku.item.id, quantity: sku.quantity }
                    })

                    for (const orderItem of orderItems) {
    
                        await skuAppModel.increaseRealStock(orderItem.id, { quantity: orderItem.quantity })
                        await skuAppModel.increaseAvailableStock(orderItem.id, { quantity: orderItem.quantity })
                    }
                }

                const updatedOrder = await OrderModel.findOneAndUpdate({ id: request.params.id }, { status: 'CANCELED' }, { new: true });
                this.setResponse(updatedOrder);

            } else {

                if (order.status != 'OPEN') {
                    this.setResponse({ message: `You cannot update the order status to canceled from the current status` }, 400);
                    return this.response();
                }

                const updatedOrder = await OrderModel.findOneAndUpdate({ id }, { status: 'CANCELED' }, { new: true });
                this.setResponse(updatedOrder);

            }

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async validateCustomer(data) {

        const customer = await CustomerModel.findOne({ id: data.customer_id });

        if (!customer) {
            this.setResponse({ message: `Customer ${data.customer_id} not found` }, 400);
            return { isInvalid: true };
        }

        customer.historic = undefined;
        customer.__v = undefined;
        data.customer_id = undefined;
        data.customer = customer;

        return { isInvalid: false };

    }

    async validateItems(body) {

        const _ids = body.items.map(item => item._id);
        const products = await SkuModel.find({ _id: _ids });
        const response = new Array();
        body.items.forEach(item => {
            products.find(data => {
                if (data._id == item._id) item = { item: data, quantity: item.quantity }
            })
            response.push(item);
        });
        body.items = response;

        if (!products || !products.length) {
            this.setResponse({ message: 'Products was not found' }, 400);
            return { isInvalid: true };
        }

        return { isInvalid: false };
    }
}

function clearCustomer(body) {
    body.customer._id = undefined;
    body.customer.historic = undefined;
    body.customer.created_at = undefined;
    body.customer.__v = undefined;
}

function formatRequest(data, isUpdated = false) {

    data.updated_at = undefined;
    data.created_at = undefined;
    data.deleted = undefined;
    data.id = undefined;
    data.price = undefined;

    for (const prop in data) {
        if (!data[prop]) delete data[prop];
    }
}

function xmlToJson(data) {

    const code = data.split('<Codigo>')[1].split('</Codigo>')[0];
    const value = data.split('<Valor>')[1].split('</Valor>')[0];
    const estimated_arrival = data.split('<PrazoEntrega>')[1].split('</PrazoEntrega>')[0];

    return { code, value, estimated_arrival };
}

function formatFreight({ postalCode, weight, length, height, width, value, serviceCode }) {

    const options = {
        nCdEmpresa: "",
        sDsSenha: "",
        nCdServico: serviceCode,
        sCepOrigem: postalCode,
        sCepDestino: process.env.CEP, //postalCodeDestiny,
        nVlPeso: weight,
        nCdFormato: "1",
        nVlComprimento: length, //centimetros  > 16 - 105 <
        nVlLargura: width, //centimetros > 11 - 105 < 
        nVlAltura: height, //centimetros
        nVlDiametro: "0", //centimetros
        sCdMaoPropria: "S",
        nVlValorDeclarado: value,
        sCdAvisoRecebimento: "N",
        StrRetorno: "xml"
    }

    const queryString = JSON.stringify(options)
        .replace(/{/g, '')
        .replace(/}/g, '')
        .replace(/"/g, '')
        .replace(/:/g, '=')
        .replace(/,/g, '&')

    return `http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx?${queryString}`;
}

function make_request(urlApi) {
    return new Promise((resolve, reject) => {
        request(urlApi,
            (err, res, body) => {
                if (body && body.includes('Erro 400')) {
                    resolve({ error: true });
                }
                if (!err && res.statusCode === 200) {
                    resolve({ success: true, body })
                }
                reject(err);
            });
    });
}

module.exports = Order;