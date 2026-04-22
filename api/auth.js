/**
 * TECHOPRINT 2026 - Unified Authentication System
 * 6 Roles: Admin, Teacher, Student, Designer, Publisher, Delivery Staff
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Notification } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'techoprint2026-secret-key-very-secure';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

// ==================== ROLE DEFINITIONS ====================
const ROLES = {
    STUDENT: 'student',
    TEACHER: 'teacher',
    DESIGNER: 'designer',
    PUBLISHER: 'publisher',
    ADMIN: 'admin',
    DELIVERY: 'delivery'
};

const ROLE_PERMISSIONS = {
    student: ['read:books', 'purchase:books', 'create:orders', 'manage:own-wallet', 'track:own-orders', 'create:tickets'],
    teacher: ['read:books', 'create:books', 'purchase:books', 'create:orders', 'manage:own-wallet', 'track:own-orders', 'create:tickets', 'invite:students'],
    designer: ['read:books', 'create:designs', 'sell:designs', 'create:orders', 'manage:own-wallet', 'track:own-orders', 'create:tickets'],
    publisher: ['read:books', 'create:books', 'publish:books', 'manage:own-books', 'create:orders', 'manage:own-wallet', 'track:own-orders', 'create:tickets'],
    admin: ['*'],
    delivery: ['track:all-orders', 'update:order-status', 'view:delivery-map', 'manage:own-deliveries']
};

// ==================== HELPERS ====================
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.userId,
            email: user.email,
            role: user.role,
            iat: Math.floor(Date.now() / 1000)
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const isAccountLocked = (user) => {
    if (user.lockUntil && user.lockUntil > Date.now()) {
        return true;
    }
    return false;
};

// ==================== MIDDLEWARE ====================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token' });
        }
        req.user = decoded;
        next();
    });
};

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
            });
        }
        next();
    };
};

const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        
        const userRole = req.user.role;
        const permissions = ROLE_PERMISSIONS[userRole] || [];
        
        if (permissions.includes('*') || permissions.includes(permission)) {
            next();
        } else {
            return res.status(403).json({ 
                success: false, 
                message: `Permission denied: ${permission}` 
            });
        }
    };
};

// ==================== REGISTER ====================
router.post('/register', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            phone,
            role = ROLES.STUDENT,
            grade,
            school,
            subjects
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'First name, last name, email, and password are required'
            });
        }

        // Validate role
        const validRoles = Object.values(ROLES);
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create user
        const user = new User({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password,
            phone,
            role,
            education: {
                grade: grade || null,
                school: school || '',
                subjects: subjects || []
            }
        });

        await user.save();

        // Generate verification code
        const verificationCode = generateOTP();
        user.verificationCode = await crypto.createHash('sha256').update(verificationCode).digest('hex');
        user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await user.save();

        // Generate token
        const token = generateToken(user);

        // Create welcome notification
        const notification = new Notification({
            userId: user.userId,
            title: '👋 مرحباً بك في TECHOPRINT 2026!',
            message: `مرحباً ${firstName}! تم إنشاء حسابك بنجاح.`,
            type: 'system'
        });
        await notification.save();

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: {
                user: user.toSafeObject(),
                token,
                verificationRequired: true,
                verificationCode: verificationCode // In production, send via SMS/Email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
});

// ==================== LOGIN ====================
router.post('/login', async (req, res) => {
    try {
        const { email, password, deviceId } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is locked
        if (isAccountLocked(user)) {
            const lockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(423).json({
                success: false,
                message: `Account locked. Try again in ${lockTime} minutes.`,
                lockUntil: user.lockUntil
            });
        }

        // Verify password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            // Increment failed attempts
            user.failedLoginAttempts += 1;
            
            // Lock account after 5 failed attempts
            if (user.failedLoginAttempts >= 5) {
                user.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
                await user.save();
                return res.status(423).json({
                    success: false,
                    message: 'Account locked due to multiple failed login attempts. Try again in 30 minutes.'
                });
            }
            
            await user.save();
            
            return res.status(401).json({
                success: false,
                message: `Invalid email or password. ${5 - user.failedLoginAttempts} attempts remaining.`
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Reset failed attempts and update login info
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        user.lastLogin = new Date();
        user.lastLoginIP = req.ip;
        await user.save();

        // Generate token
        const token = generateToken(user);

        // Create login notification
        const notification = new Notification({
            userId: user.userId,
            title: '🔐 تسجيل دخول',
            message: 'تم تسجيل دخولك إلى حسابك.',
            type: 'system',
            data: { ip: req.ip }
        });
        await notification.save();

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toSafeObject(),
                token,
                permissions: ROLE_PERMISSIONS[user.role]
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
});

// ==================== VERIFY EMAIL ====================
router.post('/verify', async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify code
        const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
        if (user.verificationCode !== hashedCode) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        // Check expiry
        if (user.verificationExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'Verification code has expired'
            });
        }

        // Mark as verified
        user.isVerified = true;
        user.verificationCode = null;
        user.verificationExpires = null;
        await user.save();

        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Verification failed'
        });
    }
});

// ==================== FORGOT PASSWORD ====================
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Don't reveal if email exists
            return res.json({
                success: true,
                message: 'If the email exists, a reset link has been sent'
            });
        }

        // Generate reset code
        const resetCode = generateOTP();
        user.verificationCode = await crypto.createHash('sha256').update(resetCode).digest('hex');
        user.verificationExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        // In production, send via SMS/Email
        // For demo, return in response
        res.json({
            success: true,
            message: 'If the email exists, a reset code has been sent',
            resetCode: resetCode // Remove in production!
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Request failed'
        });
    }
});

// ==================== RESET PASSWORD ====================
router.post('/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify code
        const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
        if (user.verificationCode !== hashedCode) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reset code'
            });
        }

        // Update password
        user.password = newPassword;
        user.verificationCode = null;
        user.verificationExpires = null;
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Password reset failed'
        });
    }
});

// ==================== GET PROFILE ====================
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user.userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                user: user.toSafeObject(),
                permissions: ROLE_PERMISSIONS[user.role]
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get profile'
        });
    }
});

// ==================== UPDATE PROFILE ====================
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const allowedUpdates = ['firstName', 'lastName', 'phone', 'profile', 'education', 'settings'];
        const updates = {};
        
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const user = await User.findOneAndUpdate(
            { userId: req.user.userId },
            { $set: updates },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Profile updated',
            data: { user: user.toSafeObject() }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Profile update failed'
        });
    }
});

// ==================== CHANGE PASSWORD ====================
router.put('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findOne({ userId: req.user.userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isValid = await user.comparePassword(currentPassword);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Password change failed'
        });
    }
});

// ==================== GET USER BY ID ====================
router.get('/users/:userId', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Only return limited info for non-admins
        const publicInfo = {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            profile: { avatar: user.profile?.avatar },
            stats: { rating: user.stats?.rating }
        };

        res.json({
            success: true,
            data: { user: publicInfo }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get user'
        });
    }
});

// ==================== SEARCH USERS (Admin Only) ====================
router.get('/users', authenticateToken, requireRole(ROLES.ADMIN), async (req, res) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;
        
        const query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { userId: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password -failedLoginAttempts -lockUntil')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                    hasMore: page * limit < total
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to search users'
        });
    }
});

// ==================== UPDATE USER STATUS (Admin Only) ====================
router.put('/users/:userId/status', authenticateToken, requireRole(ROLES.ADMIN), async (req, res) => {
    try {
        const { isActive } = req.body;
        
        const user = await User.findOneAndUpdate(
            { userId: req.params.userId },
            { $set: { isActive } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'}`,
            data: { user: user.toSafeObject() }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update user status'
        });
    }
});

// ==================== LOGOUT ====================
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        // In a real app, you'd invalidate the token
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
});

// ==================== REFRESH TOKEN ====================
router.post('/refresh-token', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user.userId });
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        const newToken = generateToken(user);
        
        res.json({
            success: true,
            data: { token: newToken }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Token refresh failed'
        });
    }
});

// Export middleware and helpers
module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.requireRole = requireRole;
module.exports.requirePermission = requirePermission;
module.exports.ROLES = ROLES;
module.exports.ROLE_PERMISSIONS = ROLE_PERMISSIONS;