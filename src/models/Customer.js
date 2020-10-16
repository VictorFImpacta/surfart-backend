require('dotenv').config();

const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const CustomerModel = mongoose.model('Customer');

const selectString = '-_id -__v -password';

class Customer {

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

    async auth(data) {
        try {

            console.log(data)

            const { email, password } = data;

            console.log({ email, password })

            if (!email || !password) {
                this.setResponse({ message: 'Please, fill in all fields required' }, 400);
                return this.response()
            }

            const customer = await CustomerModel.findOne({ email }).select('+password');

            if (!customer) {
                this.setResponse({ message: 'Customer was not found' }, 400);
                return this.response();
            }

            if (!await bcrypt.compare(password, customer.password)) {
                this.setResponse({ message: 'Invalid password' }, 400);
                return this.response();
            }

            const token = `Bearer ${generateToken({ id: customer.id })}`;
            this.setResponse({ token });

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    }

    async getAll() {
        try {
            const customers = await CustomerModel.find({ deleted: false });
            this.setResponse({ docs: customers });

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async list({ page = 1, limit = 10 }) {
        try {

            if (limit > 50) {
                limit = 50;
            }

            const customers = await CustomerModel.paginate({ deleted: false }, { page: Number(page), limit: Number(limit), select: selectString });
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

            const customer = await CustomerModel.paginate({ id, deleted: false }, { select: selectString });

            if (!customer.docs.length) {
                this.setResponse({ message: 'Customer was not found!' }, 400);
                return this.response();
            }

            this.setResponse(customer.docs[0]);

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

            const customer = await CustomerModel.create(data);
            customer.__v = undefined;
            customer.password = undefined;

            const token = `Bearer ${generateToken({ id: customer.id })}`;
            this.setResponse({ customer, token });

        } catch (error) {
            this.setResponse(error, 500);
            if (error.errmsg && error.errmsg.includes('E11000')) {
                this.setResponse({ message: 'email already used' }, 400)
            }
            await CustomerModel.findOneAndDelete({ id: customerCreated.id });
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
            data.updated_at = new Date();

            const updatedCustomer = await CustomerModel.findOneAndUpdate({ id }, customer, { new: true });
            updatedCustomer.__v = undefined;

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

            const deletedCustomer = await CustomerModel.findOneAndUpdate({ id }, { deleted: true }, { new: true });
            deletedCustomer.password = undefined;
            deletedCustomer.__v = undefined;
            this.setResponse(deletedCustomer);

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
            const addressTransformed = this.validate(data, validateArray);

            if (addressTransformed.isInvalid) {
                return this.response();
            }

            customer.result.addresses.push(addressTransformed);

            const customerUpdated = await CustomerModel.findOneAndUpdate({ id }, customer.result, { new: true });

            this.setResponse(customerUpdated);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    }
}

function generateToken(params = {}) {
    return jwt.sign(params, process.env.SECRET, {
        expiresIn: 3600
    });
}

function formatRequest(data, isUpdated = false) {

    data.updated_at = undefined;
    data.created_at = undefined;
    data.deleted = undefined;
    data.historic = undefined;
    data.address = undefined;
    data.admin = false;
    data.id = undefined;

    for (const prop in data) {
        if (!data[prop]) delete data[prop];
    }
}

module.exports = Customer;