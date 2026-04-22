/**
 * TECHOPRINT 2026 - Database Schemas & Models
 * All data structures with AES-256 encryption
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// ==================== ENCRYPTION HELPERS ====================
const ENCRYPTION_KEY = crypto.createHash('sha256')
    .update(process.env.ENCRYPTION_KEY || 'techoprint-encryption-key-2026')
    .digest();
const IV_LENGTH = 16;

const encryptField = (text) => {
    if (!text) return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

const decryptField = (encryptedText) => {
    if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
    try {
        const parts = encryptedText.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        return encryptedText;
    }
};

// ==================== USER SCHEMA ====================
const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        default: () => 'TP-' + crypto.randomBytes(6).toString('hex').toUpperCase()
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        trim: true,
        default: null
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'designer', 'publisher', 'admin', 'delivery'],
        default: 'student',
        index: true
    },
    
    // Profile Information
    profile: {
        avatar: {
            type: String,
            default: null
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot exceed 500 characters'],
            default: ''
        },
        dateOfBirth: Date,
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            default: null
        }
    },
    
    // Educational Info (for students/teachers)
    education: {
        grade: {
            type: Number,
            min: 1,
            max: 12,
            default: null
        },
        school: {
            type: String,
            default: ''
        },
        subjects: [{
            type: String
        }]
    },
    
    // Wallet Balance
    wallet: {
        IQD: {
            type: Number,
            default: 0,
            min: 0
        },
        USD: {
            type: Number,
            default: 0,
            min: 0
        },
        pendingIQD: {
            type: Number,
            default: 0,
            min: 0
        },
        pendingUSD: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    
    // Location for delivery staff
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [44.3661, 33.3152] // Baghdad default
        },
        address: String,
        lastUpdated: Date
    },
    
    // Status & Verification
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: String,
    verificationExpires: Date,
    
    // Security
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    lastLogin: Date,
    lastLoginIP: String,
    
    // Settings
    settings: {
        language: {
            type: String,
            enum: ['ar', 'en', 'ku'],
            default: 'ar'
        },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            sms: { type: Boolean, default: false }
        },
        privacy: {
            showProfile: { type: Boolean, default: true },
            showOrders: { type: Boolean, default: true }
        }
    },
    
    // Stats
    stats: {
        totalOrders: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
        totalEarned: { type: Number, default: 0 },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        totalRatings: { type: Number, default: 0 }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ==================== PRE-SAVE HOOKS ====================
UserSchema.pre('save', async function(next) {
    // Hash password if modified
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    
    // Generate userId if new
    if (!this.userId) {
        this.userId = 'TP-' + crypto.randomBytes(6).toString('hex').toUpperCase();
    }
    
    next();
});

// ==================== METHODS ====================
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.toSafeObject = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.failedLoginAttempts;
    delete obj.lockUntil;
    delete obj.verificationCode;
    return obj;
};

UserSchema.methods.updateLocation = function(coordinates, address) {
    this.currentLocation = {
        type: 'Point',
        coordinates: coordinates,
        address: address,
        lastUpdated: new Date()
    };
    return this.save();
};

// ==================== TRANSACTION SCHEMA ====================
const TransactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        default: () => 'TX-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase()
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['deposit', 'withdrawal', 'transfer_sent', 'transfer_received', 'purchase', 'sale', 'refund', 'commission'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        enum: ['IQD', 'USD'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    
    // Reference for deposits
    reference: {
        type: String,
        sparse: true
    },
    
    // Receipt info
    receipt: {
        filename: String,
        originalName: String,
        uploadedAt: Date,
        ocrResult: String,
        verified: Boolean
    },
    
    // Transfer details
    transfer: {
        to: String, // Recipient userId
        from: String, // Sender userId
        note: String
    },
    
    // Order reference
    orderId: {
        type: String,
        index: true
    },
    
    // Admin review
    reviewedBy: String,
    reviewedAt: Date,
    reviewNote: String,
    
    // Financial balance snapshot
    balanceBefore: Number,
    balanceAfter: Number,
    
    // Metadata
    metadata: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String
    
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ==================== BOOK SCHEMA ====================
const BookSchema = new mongoose.Schema({
    bookId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        default: () => 'BK-' + crypto.randomBytes(5).toString('hex').toUpperCase()
    },
    title: {
        type: String,
        required: [true, 'Book title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    author: {
        type: String,
        required: [true, 'Author name is required']
    },
    publisher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    
    // Classification
    subject: {
        type: String,
        enum: ['math', 'science', 'arabic', 'english', 'history', 'geography', 'art', 'music', 'other'],
        required: true,
        index: true
    },
    grade: {
        type: Number,
        min: 1,
        max: 12,
        required: true,
        index: true
    },
    language: {
        type: String,
        enum: ['ar', 'ku', 'en'],
        default: 'ar'
    },
    
    // Pricing
    price: {
        IQD: { type: Number, required: true, min: 0 },
        USD: { type: Number, default: 0, min: 0 }
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    
    // Files
    coverImage: String,
    previewPages: [{
        pageNumber: Number,
        filename: String,
        signedUrl: String
    }],
    fullPdf: {
        filename: String,
        encrypted: { type: Boolean, default: true }
    },
    
    // Statistics
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    
    // Status
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    approvedBy: String,
    approvedAt: Date,
    
    // Tags
    tags: [String]
    
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ==================== ORDER SCHEMA ====================
const OrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        default: () => 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase()
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    
    // Order Type
    type: {
        type: String,
        enum: ['print', 'digital', 'custom'],
        required: true
    },
    
    // Items
    items: [{
        bookId: String,
        bookTitle: String,
        quantity: { type: Number, default: 1 },
        pages: [Number],
        pricePerUnit: Number,
        totalPrice: Number
    }],
    
    // Status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'printing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
        default: 'pending',
        index: true
    },
    statusHistory: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
        updatedBy: String
    }],
    
    // Pricing
    subtotal: Number,
    deliveryFee: Number,
    discount: Number,
    total: Number,
    currency: { type: String, enum: ['IQD', 'USD'], default: 'IQD' },
    
    // Delivery Info
    delivery: {
        address: {
            street: String,
            city: String,
            district: String,
            building: String,
            floor: String,
            notes: String
        },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: [Number] // [longitude, latitude]
        },
        preferredTime: String,
        recipientName: String,
        recipientPhone: String
    },
    
    // Tracking
    tracking: {
        currentLocation: {
            type: { type: String, enum: ['Point'] },
            coordinates: [Number]
        },
        estimatedDelivery: Date,
        actualDelivery: Date,
        trackingUpdates: [{
            location: String,
            status: String,
            timestamp: { type: Date, default: Date.now },
            description: String
        }]
    },
    
    // Delivery Staff
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedAt: Date,
    
    // Payment
    payment: {
        method: { type: String, enum: ['wallet', 'cash_on_delivery', 'bank_transfer'] },
        status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'] },
        transactionId: String,
        paidAt: Date
    },
    
    // Print Details
    printSpecs: {
        paperSize: { type: String, enum: ['A4', 'A5', 'A3'], default: 'A4' },
        paperType: { type: String, enum: ['standard', 'glossy', 'matte'], default: 'standard' },
        binding: { type: String, enum: ['none', 'staple', 'spiral', 'hardcover'], default: 'none' },
        colorMode: { type: String, enum: ['black_white', 'color'], default: 'black_white' },
        copies: { type: Number, default: 1 }
    }
    
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create geospatial index for delivery tracking
OrderSchema.index({ 'tracking.currentLocation': '2dsphere' });
OrderSchema.index({ 'delivery.location': '2dsphere' });

// ==================== TICKET SCHEMA ====================
const TicketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        default: () => 'TKT-' + Date.now().toString(36).toUpperCase()
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['support', 'receipt_issue', 'delivery_issue', 'custom_design', 'refund_request', 'general'],
        required: true
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'waiting_response', 'resolved', 'closed'],
        default: 'open',
        index: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    
    // Related entities
    orderId: String,
    transactionId: String,
    
    // Attachments
    attachments: [{
        filename: String,
        originalName: String,
        type: String
    }],
    
    // Responses
    responses: [{
        by: String, // userId or 'system' or adminId
        byRole: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
        isInternal: { type: Boolean, default: false }
    }],
    
    // Assignment
    assignedTo: String,
    assignedAt: Date,
    
    // Resolution
    resolvedAt: Date,
    resolutionNote: String,
    rating: Number,
    
    // Metadata
    source: { type: String, enum: ['web', 'mobile', 'api'], default: 'web' },
    ipAddress: String
    
}, {
    timestamps: true
});

// ==================== DELIVERY STAFF SCHEMA ====================
const DeliveryStaffSchema = new mongoose.Schema({
    staffId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        default: () => 'DV-' + crypto.randomBytes(5).toString('hex').toUpperCase()
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Vehicle
    vehicle: {
        type: { type: String, enum: ['motorcycle', 'car', 'van', 'bicycle'] },
        plateNumber: String,
        color: String
    },
    
    // Current Location
    currentLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: [Number],
        lastUpdated: Date,
        isOnline: { type: Boolean, default: false }
    },
    
    // Status
    status: {
        type: String,
        enum: ['available', 'busy', 'offline'],
        default: 'offline'
    },
    
    // Current delivery
    currentDelivery: {
        orderId: String,
        startedAt: Date,
        estimatedTime: Number
    },
    
    // Stats
    stats: {
        totalDeliveries: { type: Number, default: 0 },
        completedToday: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        averageTime: Number
    },
    
    // Coverage Area
    coverageArea: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: [Number],
        radius: Number // in meters
    }
    
}, {
    timestamps: true
});

DeliveryStaffSchema.index({ currentLocation: '2dsphere' });

// ==================== NOTIFICATION SCHEMA ====================
const NotificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['order', 'payment', 'delivery', 'system', 'promotion', 'message'],
        default: 'system'
    },
    status: {
        type: String,
        enum: ['unread', 'read', 'archived'],
        default: 'unread'
    },
    data: mongoose.Schema.Types.Mixed,
    link: String,
    readAt: Date,
    expiresAt: Date
    
}, {
    timestamps: true
});

// ==================== CREATE MODELS ====================
const User = mongoose.model('User', UserSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);
const Book = mongoose.model('Book', BookSchema);
const Order = mongoose.model('Order', OrderSchema);
const Ticket = mongoose.model('Ticket', TicketSchema);
const DeliveryStaff = mongoose.model('DeliveryStaff', DeliveryStaffSchema);
const Notification = mongoose.model('Notification', NotificationSchema);

// ==================== EXPORTS ====================
module.exports = {
    User,
    Transaction,
    Book,
    Order,
    Ticket,
    DeliveryStaff,
    Notification,
    encryptField,
    decryptField
};