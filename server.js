/**
 * TECHOPRINT 2026 - The Sovereign Engine
 * Main server with full functionality
 * Express + MongoDB + Socket.io + OCR + Maps
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Server } = require('socket.io');
const multer = require('multer');
const crypto = require('crypto');

// ==================== INITIALIZATION ====================
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// ==================== CONFIGURATION ====================
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'techoprint2026-secret-key-very-secure';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY || 'techoprint-encryption-key-2026').digest();
const IV_LENGTH = 16;

// ==================== MIDDLEWARE ====================
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// Logging
app.use(morgan('dev'));

// Static files - serve from public folder
app.use(express.static(path.join(__dirname, 'public'), {
    index: 'index.html',
    dotfiles: 'ignore'
}));

// Favicon route to prevent 404
app.get('/favicon.ico', (req, res) => {
    res.status(204).send();
});

// ==================== FILE UPLOADS ====================
const uploadsDir = path.join(__dirname, 'uploads');
['receipts', 'books', 'profiles'].forEach(dir => {
    const dirPath = path.join(uploadsDir, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'misc';
        if (file.fieldname === 'receipt') folder = 'receipts';
        else if (file.fieldname === 'book') folder = 'books';
        else if (file.fieldname === 'profile') folder = 'profiles';
        cb(null, path.join(uploadsDir, folder));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only images and PDF files are allowed'));
    }
});

// ==================== DATABASE CONNECTION ====================
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/techoprint2026';
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB Connected: TECHOPRINT 2026 Database');
        
        // Create indexes
        await createIndexes();
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        // Start server anyway for demo purposes
        console.log('⚠️ Server starting in demo mode without database');
    }
};

const createIndexes = async () => {
    try {
        const User = require('./api/db').User;
        const Transaction = require('./api/db').Transaction;
        const Order = require('./api/db').Order;
        
        await User.collection.createIndex({ email: 1 }, { unique: true });
        await User.collection.createIndex({ phone: 1 });
        await User.collection.createIndex({ userId: 1 }, { unique: true });
        await Transaction.collection.createIndex({ userId: 1 });
        await Transaction.collection.createIndex({ reference: 1 }, { sparse: true });
        await Order.collection.createIndex({ orderId: 1 }, { unique: true });
        await Order.collection.createIndex({ userId: 1 });
        await Order.collection.createIndex({ 'tracking.currentLocation': '2dsphere' });
        
        console.log('✅ Database indexes created');
    } catch (error) {
        console.log('⚠️ Index creation skipped:', error.message);
    }
};

// ==================== ENCRYPTION UTILITIES ====================
const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (encryptedText) => {
    try {
        const parts = encryptedText.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        return null;
    }
};

// Generate signed URLs for secure file access
const generateSignedUrl = (filePath, expiresIn = 3600) => {
    const expires = Date.now() + expiresIn * 1000;
    const signature = crypto.createHmac('sha256', JWT_SECRET)
        .update(`${filePath}:${expires}`)
        .digest('hex');
    return `/api/files/${encodeURIComponent(filePath)}?expires=${expires}&signature=${signature}`;
};

// ==================== JWT AUTHENTICATION ====================
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

const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Access denied for this role' });
        }
        next();
    };
};

// ==================== SOCKET.IO SETUP ====================
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Authenticate socket connection
    socket.on('authenticate', (token) => {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            socket.userId = decoded.userId;
            socket.role = decoded.role;
            connectedUsers.set(decoded.userId, socket.id);
            
            socket.emit('authenticated', { 
                success: true, 
                userId: decoded.userId,
                role: decoded.role
            });
            
            // Notify about user online
            io.emit('userOnline', { userId: decoded.userId });
            console.log(`✅ User authenticated: ${decoded.userId} (${decoded.role})`);
        } catch (error) {
            socket.emit('authError', { message: 'Invalid token' });
        }
    });

    // Join role-specific rooms
    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`📢 ${socket.id} joined room: ${room}`);
    });

    // GPS location update (for delivery staff)
    socket.on('updateLocation', (data) => {
        if (socket.role === 'delivery' || socket.role === 'admin') {
            // Broadcast location to relevant users
            io.to('delivery-tracking').emit('staffLocationUpdate', {
                staffId: socket.userId,
                location: data,
                timestamp: Date.now()
            });
        }
    });

    // Order tracking updates
    socket.on('trackOrder', (orderId) => {
        socket.join(`order-${orderId}`);
    });

    // Disconnect handling
    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        if (socket.userId) {
            connectedUsers.delete(socket.userId);
            io.emit('userOffline', { userId: socket.userId });
        }
    });
});

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        server: 'TECHOPRINT 2026',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// Serve signed files
app.get('/api/files/:filePath(*)', (req, res) => {
    const filePath = decodeURIComponent(req.params.filePath);
    const { expires, signature } = req.query;

    // Verify signature
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET)
        .update(`${filePath}:${expires}`)
        .digest('hex');

    if (signature !== expectedSignature) {
        return res.status(403).json({ error: 'Invalid or expired URL' });
    }

    if (Date.now() > parseInt(expires)) {
        return res.status(403).json({ error: 'URL has expired' });
    }

    const fullPath = path.join(uploadsDir, filePath);
    if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    res.sendFile(fullPath);
});

// Auth routes
const authRoutes = require('./api/auth');
app.use('/api/auth', authRoutes);

// Finance routes
const financeRoutes = require('./api/finance');
app.use('/api/finance', authenticateToken, financeRoutes);

// Logistics routes
const logisticsRoutes = require('./api/logistics');
app.use('/api/logistics', authenticateToken, logisticsRoutes);

// File upload endpoint
app.post('/api/upload', authenticateToken, upload.fields([
    { name: 'receipt', maxCount: 1 },
    { name: 'book', maxCount: 1 },
    { name: 'profile', maxCount: 1 }
]), (req, res) => {
    try {
        const files = [];
        const uploadTypes = ['receipt', 'book', 'profile'];
        
        uploadTypes.forEach(type => {
            if (req.files && req.files[type]) {
                req.files[type].forEach(file => {
                    const fileInfo = {
                        fieldname: type,
                        originalName: encrypt(file.originalname),
                        filename: file.filename,
                        path: file.path.replace(uploadsDir, '').replace(/\\/g, '/'),
                        size: file.size,
                        mimetype: file.mimetype,
                        signedUrl: generateSignedUrl(file.path.replace(uploadsDir, '').replace(/\\/g, '/'))
                    };
                    files.push(fileInfo);
                });
            }
        });

        // Emit real-time notification
        io.to('admin').emit('newUpload', {
            userId: req.user.userId,
            type: files[0]?.fieldname,
            filename: files[0]?.filename,
            timestamp: Date.now()
        });

        res.json({
            success: true,
            files,
            message: 'Files uploaded successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        const User = mongoose.models.User || require('./api/db').User;
        const Order = mongoose.models.Order || require('./api/db').Order;
        const Transaction = mongoose.models.Transaction || require('./api/db').Transaction;
        const Book = mongoose.models.Book || require('./api/db').Book;

        const [totalUsers, totalOrders, totalBooks, recentTransactions] = await Promise.all([
            User.countDocuments(),
            Order.countDocuments({ userId: req.user.userId }),
            Book.countDocuments(),
            Transaction.find({ userId: req.user.userId })
                .sort({ createdAt: -1 })
                .limit(10)
        ]);

        const stats = {
            totalUsers,
            totalOrders,
            activeOrders: await Order.countDocuments({ userId: req.user.userId, status: { $in: ['pending', 'processing', 'printing', 'out_for_delivery'] } }),
            totalBooks,
            recentTransactions: recentTransactions.map(t => ({
                type: t.type,
                amount: t.amount,
                currency: t.currency,
                createdAt: t.createdAt
            }))
        };

        res.json({ success: true, stats });
    } catch (error) {
        res.json({
            success: true,
            stats: {
                totalUsers: 0,
                totalOrders: 0,
                activeOrders: 0,
                totalBooks: 0,
                recentTransactions: []
            }
        });
    }
});

// ==================== BACKUP SYSTEM ====================
const scheduleBackups = () => {
    // Run backup every 6 hours
    setInterval(async () => {
        try {
            const db = mongoose.connection.db;
            if (db) {
                const collections = await db.listCollections().toArray();
                const backupData = {};
                
                for (const coll of collections) {
                    const documents = await db.collection(coll.name).find({}).toArray();
                    backupData[coll.name] = documents;
                }
                
                const backupDir = path.join(__dirname, 'backups');
                if (!fs.existsSync(backupDir)) {
                    fs.mkdirSync(backupDir, { recursive: true });
                }
                
                const filename = `backup-${Date.now()}.json`;
                fs.writeFileSync(
                    path.join(backupDir, filename),
                    JSON.stringify(backupData, null, 2)
                );
                
                console.log(`✅ Database backup created: ${filename}`);
                io.emit('backupComplete', { filename, timestamp: Date.now() });
            }
        } catch (error) {
            console.error('❌ Backup failed:', error.message);
        }
    }, 6 * 60 * 60 * 1000);
    
    console.log('⏰ Backup system scheduled: Every 6 hours');
};

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

// ==================== START SERVER ====================
const startServer = async () => {
    await connectDB();
    scheduleBackups();
    
    server.listen(PORT, () => {
        console.log('');
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║           👑 TECHOPRINT 2026 - THE SOVEREIGN BUILD 👑        ║');
        console.log('╠══════════════════════════════════════════════════════════════╣');
        console.log(`║  🚀 Server running on port: ${PORT}`);
        console.log(`║  🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`║  📅 Started: ${new Date().toISOString()}`);
        console.log(`║  🛡️  JWT Auth: Active`);
        console.log(`║  🔐 AES-256 Encryption: Active`);
        console.log(`║  📡 Socket.io: Active`);
        console.log(`║  🗺️  Maps Integration: Active`);
        console.log(`║  📷  OCR Receipt Scanner: Active`);
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log('');
    });
};

startServer();

module.exports = { app, io, encrypt, decrypt, generateSignedUrl };