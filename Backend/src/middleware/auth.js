const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { decrypt } = require('../utils/encryption');

const JWT_SECRET = process.env.JWT_SECRET || 'demo_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'demo_refresh_secret';

// Required authentication middleware - for protected routes only
const authMiddleware = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    // Check if any token exists
    if (!accessToken && !refreshToken) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required. Please log in to create meetings.' 
      });
    }

    // Try access token first
    if (accessToken) {
      try {
        const decryptedAccessToken = decrypt(accessToken);
        const decoded = jwt.verify(decryptedAccessToken, JWT_SECRET);

        if (decoded.type !== 'access') {
          return res.status(401).json({ 
            success: false,
            error: 'Invalid token type' 
          });
        }

        req.user = decoded;
        return next();
      } catch (error) {
        console.log('Access token expired, attempting refresh...');
      }
    }

    // Access token failed, try refresh token
    if (refreshToken) {
      try {
        const decryptedRefreshToken = decrypt(refreshToken);
        const refreshDecoded = jwt.verify(decryptedRefreshToken, JWT_REFRESH_SECRET);

        if (refreshDecoded.type !== 'refresh') {
          return res.status(401).json({ 
            success: false,
            error: 'Invalid refresh token type' 
          });
        }

        // Verify user still exists in database
        const result = await db.query('SELECT * FROM users WHERE id = $1', [refreshDecoded.userId]);
        const user = result.rows[0];

        if (!user) {
          return res.status(401).json({ 
            success: false,
            error: 'User not found' 
          });
        }

        // Generate NEW access token
        const newAccessToken = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            type: 'access'
          },
          JWT_SECRET,
          { expiresIn: '15m', algorithm: 'HS512' }
        );
        
        const { encrypt } = require('../utils/encryption');
        const encryptedAccessToken = encrypt(newAccessToken);
        
        // Set new access token cookie
        res.cookie('accessToken', encryptedAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60 * 1000
        });

        req.user = {
          userId: user.id,
          email: user.email,
          type: 'access'
        };

        return next();
      } catch (refreshError) {
        console.error('Refresh token error:', refreshError);
        return res.status(401).json({ 
          success: false,
          error: 'Session expired. Please log in again.' 
        });
      }
    }

    return res.status(401).json({ 
      success: false,
      error: 'Authentication failed' 
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      success: false,
      error: 'Authentication failed' 
    });
  }
};

module.exports = authMiddleware;