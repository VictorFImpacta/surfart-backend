const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const OrderModel = mongoose.model('Order');
const CustomerModel = mongoose.model('Customer');
const ProductModel = mongoose.model('Product');

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

    async getAll({ page = 1, limit = 10 }) {
        try {

            if (limit > 50) {
                limit = 50;
            }

            const orders = await OrderModel.paginate({}, { page, limit, select: selectString });
            this.setResponse(orders);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async getById(id) {
        try {

            const order = await OrderModel.paginate({ id }, { select: selectString });

            if (!order.docs.length) {
                this.setResponse({ message: 'Order was not found!' }, 400);
                return this.response();
            }

            this.setResponse(order.docs[0]);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async create(data) {
        try {

            const validOrder = this.validate(data, ['customer', 'items', 'value', 'toDelivery', 'billing_address']);

            if (validOrder.isInvalid) {
                return this.response();
            }

            const customerValidate = await validateCustomer.find(data);
            if (customerValidate.isInvalid) {
                return this.response();
            }

            const itemsValidate = await validateItems(data);
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

    async update(id, data) {
        try {

            const order = await OrderModel.findOne({ id });

            if (!order) {
                this.setResponse({ message: 'Order was not found' }, 400);
                return this.response();
            }

            formatRequest(data, true);

            for (const prop in data) {
                order[prop] = order[prop];
            };

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

            const deletedCategory = await OrderModel.findOneAndDelete({ id });
            this.setResponse(deletedCategory);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };
}

async function validateCustomer(customer_id) {

    const customer = await CustomerModel.paginate({ id: customer_id }, { select: selectString });

    if (!customer || !customer.docs || !customer.docs.length) {
        this.setResponse({ message: `Customer ${customer_id} not found` }, 400);
        return { isInvalid: true };
    }

    return customer;

}

async function validateItems(data) {

    const products = await ProductModel.find().where('id').in(data.items).exec();

    if (!products) {
        this.setResponse({ message: 'These products are not found' }, 400);
        return { isInvalid: true };
    }

    data.value = products.reduce((a, b) => a.price + b.price);
    data.items = products;

    return { isInvalid: false };

}

function formatRequest(data, isUpdated = false) {

    data.id = undefined;
    data.price = undefined;
    data.updated_at = undefined;
    data.created_at = undefined;
    data.updated_at = undefined;

    for (const prop in data) {
        if (!data[prop]) delete data[prop];
    }
}

module.exports = Order;