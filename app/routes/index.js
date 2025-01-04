const routes = require('express').Router();
const products = require('./product.routes');
const category = require('./category.routes');
const invoice = require('./invoice.routes');
const admin = require('./admin.routes');
const item = require('./items.routes');
const productlist = require('./products.routes');
const auth = require('./auth.routes');
const scanner = require('./scan.routes');
const exportproducts = require('./exportproducts.routes')

// const pathStarts = '/backend/'
const pathStarts = '/';

routes.use(`${pathStarts}products`, products);
routes.use(`${pathStarts}category`, category);
routes.use(`${pathStarts}invoice`, invoice);
routes.use(`${pathStarts}items`, item);
routes.use(`${pathStarts}rchoice`, productlist);

routes.use(`${pathStarts}auth`, auth);
routes.use(`${pathStarts}admin`, admin);
routes.use(`${pathStarts}scan`, scanner);

routes.use(`${pathStarts}export`, exportproducts);

module.exports = routes;
