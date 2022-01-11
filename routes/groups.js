const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groups');
const { body } = require('express-validator/check');

router.post('/create', [
    body('name', 'Please enter a name with length atleast 3 character')
    .isLength({min: 3})
],
 groupController.postCreateGroup);
router.get('/getAll', groupController.getAllGroup);
router.post('/addItem', groupController.addItem);
router.get('/getItems/:id', groupController.getItems);
router.post('/deleteItem', groupController.deleteItem);
router.post('/updateItem', groupController.updateItem);
router.post('/join', groupController.joinGroup);
router.delete('/delete/:groupId', groupController.delete);
router.post('/leave', groupController.leaveGroup);
router.post('/modifyName', groupController.modifyName);
router.get('/getMembers/:groupId', groupController.getMembers);

module.exports = router;