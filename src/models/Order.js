require('dotenv').config()

const request = require('request');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const OrderModel = mongoose.model('Order');
const CustomerModel = mongoose.model('Customer');
const SkuModel = mongoose.model('Sku');

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

            // if (request.user && request.user.admin) {
            const orders = await OrderModel.find();
            this.setResponse({ docs: orders });
            return this.response();
            // }

            // const query = [{
            //     $match: {
            //         'deleted': false,
            //         'customer.id': request.user.id
            //     }
            // }];

            // const orders = await OrderModel.aggregate(query);
            // this.setResponse({ docs: orders });

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

            let orders = await OrderModel.paginate({ deleted: false, 'customer.customer_id': request.user_id }, { page, limit, select: selectString });

            if (request.admin) {
                orders = await OrderModel.paginate({ page, limit, select: selectString });
            }

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

            const id = request.params.id;
            let order = await OrderModel.find({ id, 'customer.customer_id': request.user_id, deleted: false })

            if (request.admin) {
                order = await OrderModel.find({ id }, { select: selectString });
            }

            if (!order.length) {
                this.setResponse({ message: 'Order was not found!' }, 400);
                return this.response();
            }

            this.setResponse(orders.docs[0]);

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

            body.customer = request.user;
            // body.customer = await CustomerModel.findOne({ id: body.customer_id });

            clearCustomer(body);
            formatRequest(body);
            const categoryCreated = await OrderModel.create(body);
            this.setResponse(categoryCreated);

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
        console.log(data)
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

            const sedex = formatFreight({...data, serviceCode: '04014' });
            const pac = formatFreight({...data, serviceCode: '04510' });
            let sedexResponse = await consultCorreios(sedex);
            let pacResponse = await consultCorreios(pac);
            sedexResponse = xmlToJson(sedexResponse.body);
            pacResponse = xmlToJson(pacResponse.body);

            if (sedexResponse.estimated_arrival == "0") {
                this.setResponse({ message: 'An error has ocurred. Please, check all fields and try again.' }, 400);
                return this.response();
            }

            const response = [{...sedexResponse, service: 'Sedex' }, {...pacResponse, service: 'Pac' }];
            this.setResponse(response);

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

    async validateItems(data) {

        const products = await SkuModel.find({ id: data.items });

        if (!products || !products.length) {
            this.setResponse({ message: 'Products was not found' }, 400);
            return { isInvalid: true };
        }

        data.value = products.reduce((acc, cur) => acc + cur.price, 0);
        data.items = products;

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

function consultCorreios(urlApi) {
    return new Promise((resolve, reject) => {
        request(urlApi,
            (err, res, body) => {
                if (!err && res.statusCode === 200) {
                    resolve({ success: true, body })
                }
                reject(err);
            });
    });
}

module.exports = Order;