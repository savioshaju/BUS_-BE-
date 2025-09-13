const express = require('express');
const router = express.Router();
const { saveRoute, getRoutes } = require('../controllers/busController');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

router.post('/save-route', saveRoute);
router.get('/routes', getRoutes);

module.exports = router;