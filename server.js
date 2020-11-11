module.exports = async(databaseEnvironment) => {

    const formData = require('express-form-data');
    const express = require('express');
    const cors = require('cors');
    const dataBase = require('./src/services/initializeDatabase');
    const bodyParser = require('body-parser');

    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(formData.parse());

    app.use((req, res, next) => {
        if (req.headers.host == 'surf-art-homolog.herokuapp.com') {
            res.header('Access-Control-Allow-Origin', '*');
        }
        app.use(cors());
        next();
    })

    if (databaseEnvironment == 'homolog')
        dataBase.initializeDatabaseHomolog()

    if (databaseEnvironment == 'development')
        dataBase.initializeDatabaseDevelopment()

    // dataBase.initializeDatabase(),

    app.use('/api/products', require('./src/routes/ProductRouter'));
    app.use('/api/skus', require('./src/routes/SkuRouter'));
    app.use('/api/payments', require('./src/routes/PaymentsRouter'));
    app.use('/api/orders', require('./src/routes/OrderRouter'));
    app.use('/api/customers', require('./src/routes/CustomerRouter'));
    app.use('/api/categories', require('./src/routes/CategoryRouter'));
    app.use('/api/getall', require('./src/routes/GetAll.js'));

    app.listen(process.env.PORT || 3000);
}