const scans = require('../controllers/scans.controller');
var router = require('express').Router();

router.get('/check/:name', scans.checkCompanyName);

module.exports = router;
