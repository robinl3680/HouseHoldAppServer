const transactionController = require('../controllers/transactions');
const express = require('express');
const router = express.Router();

router.post('/newTransaction', transactionController.newTransaction);
router.get('/:groupId/getTransactions', transactionController.getTransactions);
router.delete('/:id/delete', transactionController.deleteTransaction);
router.post('/modify/:id', transactionController.modifyTransaction);

module.exports = router;