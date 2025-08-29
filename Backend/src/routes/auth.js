// const express = require('express');
// const AuthController = require('../controllers/authController');
// const { authenticateToken } = require('../middleware/auth');

// const router = express.Router();

// router.post('/login', AuthController.login);
// router.get('/check', authenticateToken, AuthController.checkAuth);
// router.post('/logout', AuthController.logout);

// module.exports = router;














const express = require('express');
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public auth routes
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/refresh-token', AuthController.refreshToken);

// Protected auth routes
router.get('/me', authMiddleware, AuthController.getCurrentUser);
router.post('/logout', authMiddleware, AuthController.logout);

router.get('/check', authMiddleware, AuthController.checkAuth);
// router.post('/reset-password', AuthController.reset_password);

module.exports = router;
