const mongoose = require('mongoose');
require('dotenv').config()

module.exports = {
    initializeDatabase() {
        try {
            mongoose.connect(process.env.ENV_MONGODB, {
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true
            });
            mongoose.connection.on('connected', () => {
                console.log('\n');
                console.log('=============================');
                console.log("Banco conectado com sucesso!");
                console.log('=============================');
                console.log('Rodando na porta: ', process.env.PORT || 3000);
                console.log('=============================');
                console.log('\n');
            })
        } catch (err) {
            console.log(err);
        }
    },

    initializeDatabaseHomolog() {
        try {
            mongoose.connect(process.env.ENV_MONGODB_HOMOLOG, {
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true
            });
            mongoose.connection.on('connected', () => {
                console.log('\n');
                console.log('=============================');
                console.log("Banco conectado com sucesso!");
                console.log('=============================');
                console.log('Rodando na porta: ', process.env.PORT || 3000);
                console.log('=============================');
                console.log('\n');
            })
        } catch (err) {
            console.log(err);
        }
    },

    initializeDatabaseDevelopment() {
        try {
            mongoose.connect(process.env.ENV_MONGODB_DEVELOPMENT, {
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true
            });
            mongoose.connection.on('connected', () => {
                console.log('\n');
                console.log('=============================');
                console.log("Banco conectado com sucesso!");
                console.log('=============================');
                console.log('Rodando na porta: ', process.env.PORT || 3000);
                console.log('=============================');
                console.log('\n');
            })
        } catch (err) {
            console.log(err);
        }
    }
}