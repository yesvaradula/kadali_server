const products = require('../controllers/products.controller');
var router = require('express').Router();

router.get('/excel', products.exporttoexcel);


module.exports = router;