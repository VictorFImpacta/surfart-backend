require('dotenv').config()

const sendEmail = require('../../services/notifications/sendNotification');
const template = require('../../services/notifications/notification-template');
const mongoose = require('mongoose');
const request = require('request');
mongoose.set('useFindAndModify', false);

const JunoModel = mongoose.model('Juno');
const JunoRedirectModel = mongoose.model('JunoRedirect');

class Juno {

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

    async list() {
        this.setResponse({ message: "working" });
        return this.response();
    }

    async create(request) {
        let savedRequest;
        try {

            await refresh_token();

            const { body, user } = request;

            if (!body || !body.order_id) {
                this.setResponse({ message: 'Please, fill in all required fields' });
                return this.response();
            }

            let dueDate = new Date().getTime() + 24 * 60 * 60 * 1000 * 3; // 3 dias no futuro em milissegundos
            dueDate = new Date(dueDate).toLocaleString('pt-br', 'yyyy-mm-dd').split(' ')[0];

            const payload = {
                charge: {
                    description: body.description,
                    amount: body.amount,
                    dueDate,
                    paymentAdvance: true
                },
                billing: {
                    name: `${user.first_name} ${user.last_name}`,
                    email: user.email,
                    ...body.customer,
                    notify: true
                }
            }

            const url = process.env.JUNO + '/charges';
            const headers = {
                'X-Resource-Token': process.env.JUNO_RESOURCE_TOKEN,
                'X-Api-Version': 2,
                'Authorization': process.env.JUNO_ACCESS_TOKEN
            }
            console.log(payload)
            const paymentCreated = await postRequest(url, payload, headers);

            payload.order_id = body.order_id;
            savedRequest = await JunoModel.create(payload);

            const redirectCreated = await JunoRedirectModel.create(paymentCreated);
            console.log(redirectCreated)

            console.log(`Boleto emitido! Valor: ${payload.charge.amount}`)
            this.setResponse(redirectCreated);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
            await JunoModel.findByIdAndRemove(savedRequest._id);
        } finally {
            return this.response();
        }
    };

    async webhook(request) {
        try {
            console.log('Chamou webhook!');
            const { body, user, params, query, headers } = request;
            console.log({ body, user, params, query, headers });
            await sendEmail('erickk474@gmail.com', `Webhook criado com sucesso!`, template.recovery(JSON.stringify({
                body,
                user,
                params,
                query,
                headers
            })));
            this.setResponse({ message: 'success' }, 200)
        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    }

}

async function refresh_token() {
    const url = process.env.JUNO + '/authorization-server/oauth/token?grant_type=client_credentials';
    const response = await postRequest(url, {}, { 'Authorization': process.env.JUNO_BASIC_TOKEN });
    process.env.JUNO_ACCESS_TOKEN = 'Bearer ' + response.access_token;
}

function postRequest(url, body, headers) {
    return new Promise((resolve, reject) => {
        request.post({
            url,
            body,
            headers,
            json: true
        }, (err, res, body) => {
            if (body && !body.access_token && !body._embedded && body.status != 200) {
                reject(body);
            }
            if (!err && res.statusCode == 200) {
                resolve(body);
            }
            reject(err);
        });
    });
}

module.exports = Juno;