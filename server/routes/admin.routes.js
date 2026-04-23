const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware, adminMiddleware);

router.get('/companies', adminController.getCompanies);
router.post('/companies', adminController.createCompany);

router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);

router.get('/qr-token', adminController.getQRToken);
router.put('/qr-token', adminController.updateQRToken);

module.exports = router;
