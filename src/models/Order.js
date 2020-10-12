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

    async getAll() {
        try {

            const orders = await OrderModel.find({ deleted: false });
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

            const data = request.body;
            const arrayValidate = ['customer_id', 'items', 'value']

            if (data.toDelivery) {
                arrayValidate.push('billing_address');
            }

            const validOrder = this.validate(data, arrayValidate);

            if (validOrder.isInvalid) {
                return this.response();
            }

            // if (!request.admin || request.user_id != data.customer._id) {
            //     this.setResponse({ message: 'You do not have access for this.' }, 400);
            //     return this.response();
            // }

            const customerValidate = await this.validateCustomer(data);
            if (customerValidate.isInvalid) {
                return this.response();
            }

            const itemsValidate = await this.validateItems(data);
            if (itemsValidate.isInvalid) {
                return this.response();
            }

            formatRequest(data);
            const categoryCreated = await OrderModel.create(data);
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

    async freight(data) {
        try {

            const validate = this.validate(data, ['postalCodeOrigin', 'postalCodeDestiny', 'weight',
                'length', 'height', 'width', 'value', 'serviceCode']);

            if (validate.isInvalid) {
                return this.response();
            }

            if (data.serviceCode != '04014' && data.serviceCode != '04510') {
                this.setResponse({ message: "Invalid 'serviceCode'" }, 400);
                return this.response();
            }

            const urlApi = formatFreight(data);
            const freight = await consultCorreios(urlApi);
            const freightJson = xmlToJson(freight.body);
            data.serviceCode == '04014' ? freightJson.code = 'SEDEX à vista' : freightJson.code = 'PAC à vista';
            this.setResponse(freightJson);

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

        const products = await SkuModel.find({ id: data.items })

        if (!products) {
            this.setResponse({ message: 'These products are not found' }, 400);
            return { isInvalid: true };
        }

        data.value = products.reduce((a, b) => a.price + b.price);
        data.items = products;

        return { isInvalid: false };

    }
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

function formatFreight({ postalCodeOrigin, postalCodeDestiny, weight, length, height, width, value, serviceCode }) {
    const options = {
        nCdEmpresa: "",
        sDsSenha: "",
        nCdServico: serviceCode,
        sCepOrigem: postalCodeOrigin,
        sCepDestino: postalCodeDestiny,
        nVlPeso: weight,
        nCdFormato: "1",
        nVlComprimento: length, //centimetros
        nVlAltura: height, //centimetros
        nVlLargura: width, //centimetros
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