const express = require('express');
const router = express.Router();
const { login, register, refreshToken } = require('../controllers/authController');
const { validateLogin, validateRegistration } = require('../middleware/validation');

router.post('/login', validateLogin, login);
router.post('/register', validateRegistration, register);
router.post('/refresh-token', refreshToken);

module.exports = router;