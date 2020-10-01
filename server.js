const express = require('express');
const cors = require('cors');
const dataBase = require('./src/services/initializeDatabase');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// dataBase.initializeDatabase();
dataBase.initializeDatabaseHomolog()
    // dataBase.initializeDatabaseDevelopment();

app.use('/api/products', require('./src/routes/ProductRouter'));
app.use('/api/skus', require('./src/routes/SkuRouter'));
app.use('/api/orders', require('./src/routes/OrderRouter'));
app.use('/api/customers', require('./src/routes/CustomerRouter'));
app.use('/api/categories', require('./src/routes/CategoryRouter'));
app.use('/api/subcategories', require('./src/routes/SubCategoryRouter'));
app.use('/api/payments', require('./src/routes/PaymentsRouter'));
app.use('/api/getall', require('./src/routes/GetAll.js'));

app.listen(process.env.PORT || 3000);