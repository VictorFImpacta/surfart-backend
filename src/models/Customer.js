require('dotenv').config();

const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const CustomerModel = mongoose.model('Customer');

const selectString = '-_id -__v';

class Product {

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

    formatRequest(data, isUpdated = false) {
        data.created_at = undefined;

        if (isUpdated) {
            data.updated_at = undefined;
        }

        for (const prop in data) {
            if (!data[prop]) delete data[prop];
        }
    }

    async getAll({ page = 1, limit = 10 }) {
        try {

            if (limit > 50) {
                limit = 50;
            }

            const customers = await CustomerModel.paginate({}, { page: Number(page), limit: Number(limit), select: selectString });
            this.setResponse(customers);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async getById(id) {
        try {

            const customer = await CustomerModel.findById(id);
            this.setResponse(customer);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async create(data) {
        try {

            const validCustomer = this.validate(data, ['first_name', 'last_name', 'email', 'password']);

            if (validCustomer.isInvalid) {
                return this.response();
            }

            formatRequest(data);
            const customerCreated = await CustomerModel.create(data);
            customerCreated.password = undefined;

            const token = `Bearer ${generateToken({ id: customer.id })}`;

            this.setResponse({ customerCreated, token });

        } catch (error) {
            if (error.errmsg && error.errmsg.includes('E11000')) {
                return res.status(422).send({
                    error: 'email already used'
                });
            }
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }

    };

    async update(id, data) {
        try {

            const customer = await CustomerModel.findOne({ id });

            if (!customer) {
                this.setResponse({ message: 'Customer was not found' }, 400);
                return this.response();
            }

            formatRequest(data, true);

            for (const prop in data) {
                customer[prop] = data[prop];
            };

            const updatedCustomer = await CustomerModel.findOneAndUpdate({ id }, customer, { new: true });
            this.setResponse(updatedCustomer);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async delete(id) {
        try {

            const deletedProduct = await CustomerModel.findOneAndDelete({ id });
            this.setResponse(deletedProduct);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async createAddress(id, data) {
        try {

            let customer = await this.getById(id);

            if (customer.statusCode != 200) {
                return this.setResponse({ message: 'Customer not found' }, 404);
            }

            const validateArray = ['cep', 'address', 'number', 'complement', 'neighborhood', 'location', 'state'];
            const addressTransformed = this.validate(addressTransformed, validateArray);

            if (addressTransformed.isInvalid) {
                return this.response();
            }

            customer.result.address.push(addressTransformed);

            const customerUpdated = await CustomerModel.findByIdAndUpdate(id, customer.result, { new: true });

            this.setResponse(customerUpdated);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    }
}

function formatRequest(data, isUpdated = false) {
    data.address = undefined;
    data.admin = false;
    data.created_at = undefined;

    if (isUpdated) {
        data.updated_at = undefined;
    }

    for (const prop in data) {
        if (!data[prop]) delete data[prop];
    }
}

module.exports = Product;