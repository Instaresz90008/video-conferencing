const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { encrypt, decrypt } = require('../utils/encryption');



const JWT_SECRET = process.env.JWT_SECRET

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'demo_refresh_secret';

class AuthController {
    static async register(req, res) {
        const { username, email, password, confirmPassword, name } = req.body;

        try {
            // Validate required fields
            if (!email || !confirmPassword) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            // Check if user already exists
            const existingUserResult = await db.query('SELECT * FROM public.users WHERE email = $1', [email]);
            if (existingUserResult.rows.length > 0) {
                return res.status(409).json({ error: 'User with this email already exists' });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(confirmPassword, 10);

            // Insert new user
            const userResult = await db.query(
                'INSERT INTO public.users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
                [email, passwordHash, name || username || email.split('@')[0]]
            );

            const user = userResult.rows[0];
            console.log("jwt secret key", JWT_SECRET)
            // Generate both tokens
            const accessToken = jwt.sign(
                { userId: user.id, email: user.email, type: 'access' },
                JWT_SECRET,
                { expiresIn: '15m', algorithm: 'HS512' }
            );

            const refreshToken = jwt.sign(
                { userId: user.id, email: user.email, type: 'refresh' },
                JWT_REFRESH_SECRET,
                { expiresIn: '7d', algorithm: 'HS512' }
            );

            const access_data = encrypt(accessToken);
            const refresh_data = encrypt(refreshToken);

            // Set both cookies
            res.cookie('accessToken', access_data, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000 // 15 minutes
            });

            res.cookie('refreshToken', refresh_data, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            // Return user data (excluding password hash)
            res.status(201).json({
                message: 'User registered successfully',
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        created_at: user.created_at
                    }
                }
            });

        } catch (err) {
            console.error('Registration error:', err);
            res.status(500).json({ error: 'Server error during registration' });
        }
    }

    static async login(req, res) {
        const { email, password } = req.body;

        try {
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password required' });
            }

            // Get user by email
            const result = await db.query('SELECT * FROM public.users WHERE email = $1', [email]);
            const user = result.rows[0];

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Compare password with stored bcrypt hash
            const passwordMatch = await bcrypt.compare(password, user.password_hash);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate access and refresh tokens
            const accessToken = jwt.sign(
                { userId: user.id, email: user.email, type: 'access' },
                JWT_SECRET,
                { expiresIn: '1m', algorithm: 'HS512' }
            );

            const refreshToken = jwt.sign(
                { userId: user.id, email: user.email, type: 'refresh' },
                JWT_REFRESH_SECRET,
                { expiresIn: '7d', algorithm: 'HS512' }
            );

            const access_data = encrypt(accessToken);
            const refresh_data = encrypt(refreshToken);

            // Set cookies
            res.cookie('accessToken', access_data, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1 * 60 * 1000 // 1 minute
            });

            res.cookie('refreshToken', refresh_data, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            // Return user data (excluding password hash)
            const { password_hash, ...userWithoutPassword } = user;
            res.json({
                success: true,
                user: userWithoutPassword
            });

        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ error: 'Server error' });
        }
    }

    static logout(req, res) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.json({ success: true, message: 'Logged out successfully' });
    }

    static async getCurrentUser(req, res) {
        try {
            const userId = req.user.userId;

            // Get user
            const userResult = await db.query(
                'SELECT id, email, name, created_at FROM public.users WHERE id = $1',
                [userId]
            );

            const user = userResult.rows[0];
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                authenticated: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    created_at: user.created_at
                }
            });

        } catch (err) {
            console.error('Get current user error:', err);
            res.status(500).json({ error: 'Server error' });
        }
    }

    static checkAuth(req, res) {
        res.json({
            authenticated: true,
            user: {
                id: req.user.userId,
                email: req.user.email,
                name: req.user.name
            }
        });
    }

    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.cookies;

            if (!refreshToken) {
                return res.status(401).json({ error: 'Refresh token not provided' });
            }

            const refresh_data = decrypt(refreshToken);
            const decoded = jwt.verify(refresh_data, JWT_REFRESH_SECRET);

            if (decoded.type !== 'refresh') {
                return res.status(401).json({ error: 'Invalid token type' });
            }

            // Check if user still exists
            const result = await db.query('SELECT * FROM public.users WHERE id = $1', [decoded.userId]);
            const user = result.rows[0];

            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }

            // Generate new access token
            const newAccessToken = jwt.sign(
                { userId: user.id, email: user.email, type: 'access' },
                JWT_SECRET,
                { expiresIn: '15m', algorithm: 'HS512' }
            );

            const access_data = encrypt(newAccessToken);

            res.cookie('accessToken', access_data, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000
            });

            res.json({ message: 'Token refreshed successfully' });

        } catch (error) {
            console.error('Error refreshing token:', error);
            return res.status(401).json({ error: 'Invalid refresh token' });
        }
    }

    static async resetPassword(req, res) {
        try {
            const { email, newPassword } = req.body;

            if (!email || !newPassword) {
                return res.status(400).json({ error: 'Email and new password are required' });
            }

            // Check if user exists
            const result = await db.query('SELECT * FROM public.users WHERE email = $1', [email]);
            const user = result.rows[0];

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Hash the new password
            const newPasswordHash = await bcrypt.hash(newPassword, 10);

            // Update password in DB
            await db.query(
                'UPDATE public.users SET password_hash = $1 WHERE email = $2',
                [newPasswordHash, email]
            );

            res.status(200).json({
                message: 'Password reset successful',
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name
                    }
                }
            });

        } catch (error) {
            console.error('Password reset error:', error);
            res.status(500).json({ error: 'Password reset failed' });
        }
    }
}

module.exports = AuthController;