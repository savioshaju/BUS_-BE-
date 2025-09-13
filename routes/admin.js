const express = require('express');
const router = express.Router();
const { 
  getPendingProviders, 
  approveProvider, 
  getAllUsers 
} = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/auth');

router.use(authenticateAdmin);

router.get('/pending-providers', getPendingProviders);
router.post('/approve-provider', approveProvider);
router.get('/users', getAllUsers);

module.exports = router;