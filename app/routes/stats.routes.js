const invoice = require("../controllers/invoice.controller");
var router = require("express").Router();

router.get("/invoice", invoice.getStats);

module.exports = router;
