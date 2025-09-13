const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  changePassword, 
  deleteAccount 
} = require('../controllers/userController');
const { authenticateUser } = require('../middleware/auth');
const { validatePasswordChange } = require('../middleware/validation');


router.use(authenticateUser);

router.get('/profile', getProfile);
router.put('/update-profile', updateProfile);
router.post('/change-password', validatePasswordChange, changePassword);
router.delete('/delete-account', deleteAccount);

module.exports = router;