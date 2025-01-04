const invoice = require('../controllers/invoice.controller');
var router = require('express').Router();
router.post('/new', invoice.addNewInvoice);
router.post('/update', invoice.updateInvoice);
router.post('/draft', invoice.addInvoice);
router.get('/draft', invoice.getDraftInvoices);
router.get('/blocked', invoice.getBlockedInvoices);
router.get('/:id/address', invoice.getAddressOfInvoice);
router.post('/:id/print', invoice.markInvoiceAsPrint);
router.post('/:id/address', invoice.addAddress);
router.get('/:id/details', invoice.getInvoiceDetails);
router.get('/:id/payments', invoice.getInvoicePayments);
router.delete('/:id/delete', invoice.deleteInv)
router.delete('/:id/:code/:cost', invoice.removeItemFromEstimate);
router.post('/mark/:id', invoice.markAsInvoice);
router.post('/:id/mark/:as', invoice.markStatusChange);
router.get('/payment/:id', invoice.invoicePayment);
router.post('/payment/:id', invoice.addPayments);
router.get('/printed', invoice.getPrintedList);
router.get('/list', invoice.getInvoiceList);
router.post('/archieve', invoice.archieve)
router.post('/markpaid/:id', invoice.markAsPaid);
router.get('/paid', invoice.getPaidInvoiceList);
router.get('/:id/images', invoice.getImagesOfInvoice)
router.get('/:id/images/:type', invoice.getImagesOfInvoiceByType)

// returns.
router.post('/search', invoice.searchInvoices)
router.get('/return/:id/items/:pid', invoice.validateReturnProduct)
router.post('/return', invoice.returnProducts)
router.post('/return/list', invoice.returnList)

router.get('/return/:id/:type', invoice.getReturnDetails)

// for printing returns section.

router.get('/received/:id/pending', invoice.getReturnDetails)

module.exports = router;
