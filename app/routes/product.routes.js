const products = require('../controllers/products.controller');
var router = require('express').Router();

router.post('/add', products.addProduct);
router.post('/update', products.updateProduct);
router.get('/details/:id', products.getProductDetails);
router.post('/consumed', products.getConsumed);
router.post('/delete/:id', products.deleteCode);
router.get('/getNextCode/:code', products.getNextCode);

router.post('/addscans', products.addScannedItems);
router.post('/updatescans', products.updateScannedItems);

router.get('/', products.getAllProducts);

module.exports = router;
