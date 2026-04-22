/**
 * TECHOPRINT 2026 - Financial System
 * Wallet Management, P2P Transfers, OCR Receipt Processing
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { User, Transaction, Notification, Order } = require('./db');

// Middleware from auth
const { authenticateToken, requireRole } = require('./auth');
const ROLES = require('./auth').ROLES;

// ==================== FILE UPLOAD CONFIG ====================
const uploadsDir = path.join(__dirname, '../uploads/receipts');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueName = `receipt-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|pdf/;
        if (allowed.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only images and PDFs are allowed'));
        }
    }
});

// ==================== OCR PROCESSING (Simulated) ====================
// In production, use Tesseract.js or a cloud OCR service
const processReceiptOCR = async (filePath) => {
    try {
        // This is a simulated OCR result
        // In production, integrate with Tesseract.js or Google Cloud Vision
        const simulatedResults = [
            { reference: 'TRX-' + Math.random().toString(36).substr(2, 9).toUpperCase(), amount: Math.floor(Math.random() * 100000) + 10000 },
            { reference: 'PAY-' + Math.random().toString(36).substr(2, 9).toUpperCase(), amount: Math.floor(Math.random() * 50000) + 5000 },
            { reference: 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase(), amount: Math.floor(Math.random() * 150000) + 20000 }
        ];
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return random simulated result
        return simulatedResults[Math.floor(Math.random() * simulatedResults.length)];
    } catch (error) {
        console.error('OCR Processing Error:', error);
        return null;
    }
};

// ==================== GET WALLET ====================
router.get('/wallet', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user.userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            data: {
                wallet: {
                    IQD: {
                        available: user.wallet.IQD,
                        pending: user.wallet.pendingIQD,
                        total: user.wallet.IQD + user.wallet.pendingIQD
                    },
                    USD: {
                        available: user.wallet.USD,
                        pending: user.wallet.pendingUSD,
                        total: user.wallet.USD + user.wallet.pendingUSD
                    }
                },
                currency: 'IQD'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get wallet' });
    }
});

// ==================== GET TRANSACTIONS ====================
router.get('/transactions', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 20, type, status } = req.query;
        
        const query = { userId: req.user.userId };
        if (type) query.type = type;
        if (status) query.status = status;

        const total = await Transaction.countDocuments(query);
        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get transactions' });
    }
});

// ==================== DEPOSIT REQUEST ====================
router.post('/deposit', authenticateToken, upload.single('receipt'), async (req, res) => {
    try {
        const { amount, currency = 'IQD', useOCR = false } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        const user = await User.findOne({ userId: req.user.userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Handle receipt file
        let receiptInfo = null;
        if (req.file) {
            receiptInfo = {
                filename: req.file.filename,
                originalName: req.file.originalname,
                uploadedAt: new Date()
            };

            // Process OCR if requested
            if (useOCR === 'true' || useOCR === true) {
                const ocrResult = await processReceiptOCR(req.file.path);
                if (ocrResult) {
                    receiptInfo.ocrResult = ocrResult;
                }
            }
        }

        // Update pending balance
        const pendingField = currency === 'USD' ? 'pendingUSD' : 'pendingIQD';
        user.wallet[pendingField] += parseFloat(amount);
        await user.save();

        // Create transaction record
        const transaction = new Transaction({
            userId: user.userId,
            type: 'deposit',
            amount: parseFloat(amount),
            currency,
            status: 'pending',
            receipt: receiptInfo,
            reference: receiptInfo?.ocrResult?.reference || null,
            balanceBefore: user.wallet[currency === 'USD' ? 'USD' : 'IQD'],
            balanceAfter: user.wallet[currency === 'USD' ? 'USD' : 'IQD'],
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });
        await transaction.save();

        // Create notification for admin
        const admins = await User.find({ role: 'admin', isActive: true });
        for (const admin of admins) {
            const notification = new Notification({
                userId: admin.userId,
                title: '💰 طلب إيداع جديد',
                message: `مستخدم ${user.firstName} ${user.lastName} طلب إيداع ${amount} ${currency}`,
                type: 'payment',
                data: { transactionId: transaction.transactionId, amount, currency },
                link: `/admin/finance?transaction=${transaction.transactionId}`
            });
            await notification.save();
        }

        res.status(201).json({
            success: true,
            message: 'Deposit request submitted for review',
            data: {
                transaction,
                receipt: receiptInfo
            }
        });
    } catch (error) {
        console.error('Deposit Error:', error);
        res.status(500).json({ success: false, message: 'Deposit failed' });
    }
});

// ==================== APPROVE DEPOSIT (Admin Only) ====================
router.post('/deposit/:transactionId/approve', authenticateToken, requireRole(ROLES.ADMIN), async (req, res) => {
    try {
        const { note } = req.body;
        
        const transaction = await Transaction.findOne({ transactionId: req.params.transactionId });
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        if (transaction.type !== 'deposit' || transaction.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Invalid transaction status' });
        }

        // Update transaction
        transaction.status = 'approved';
        transaction.reviewedBy = req.user.userId;
        transaction.reviewedAt = new Date();
        transaction.reviewNote = note;
        await transaction.save();

        // Update user wallet
        const user = await User.findOne({ userId: transaction.userId });
        if (user) {
            const walletField = transaction.currency === 'USD' ? 'USD' : 'IQD';
            const pendingField = transaction.currency === 'USD' ? 'pendingUSD' : 'pendingIQD';
            
            // Move from pending to available
            user.wallet[walletField] += transaction.amount;
            user.wallet[pendingField] -= transaction.amount;
            await user.save();

            // Create notification for user
            const notification = new Notification({
                userId: user.userId,
                title: '✅ تم قبول الإيداع',
                message: `تم إضافة ${transaction.amount} ${transaction.currency} إلى محفظتك`,
                type: 'payment',
                data: { transactionId: transaction.transactionId }
            });
            await notification.save();
        }

        res.json({
            success: true,
            message: 'Deposit approved',
            data: { transaction }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Approval failed' });
    }
});

// ==================== REJECT DEPOSIT (Admin Only) ====================
router.post('/deposit/:transactionId/reject', authenticateToken, requireRole(ROLES.ADMIN), async (req, res) => {
    try {
        const { note } = req.body;
        
        const transaction = await Transaction.findOne({ transactionId: req.params.transactionId });
        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        if (transaction.type !== 'deposit' || transaction.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Invalid transaction status' });
        }

        // Update transaction
        transaction.status = 'rejected';
        transaction.reviewedBy = req.user.userId;
        transaction.reviewedAt = new Date();
        transaction.reviewNote = note;
        await transaction.save();

        // Remove from pending balance
        const user = await User.findOne({ userId: transaction.userId });
        if (user) {
            const pendingField = transaction.currency === 'USD' ? 'pendingUSD' : 'pendingIQD';
            user.wallet[pendingField] -= transaction.amount;
            await user.save();

            // Notify user
            const notification = new Notification({
                userId: user.userId,
                title: '❌ تم رفض الإيداع',
                message: `تم رفض طلب الإيداع بقيمة ${transaction.amount} ${transaction.currency}. السبب: ${note || 'غير محدد'}`,
                type: 'payment',
                data: { transactionId: transaction.transactionId }
            });
            await notification.save();
        }

        res.json({
            success: true,
            message: 'Deposit rejected',
            data: { transaction }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Rejection failed' });
    }
});

// ==================== P2P TRANSFER ====================
router.post('/transfer', authenticateToken, async (req, res) => {
    try {
        const { recipientId, amount, currency = 'IQD', note } = req.body;

        if (!recipientId || !amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid transfer details' });
        }

        // Get sender
        const sender = await User.findOne({ userId: req.user.userId });
        if (!sender) {
            return res.status(404).json({ success: false, message: 'Sender not found' });
        }

        // Get recipient
        const recipient = await User.findOne({ userId: recipientId });
        if (!recipient) {
            return res.status(404).json({ success: false, message: 'Recipient not found' });
        }

        if (recipient.userId === sender.userId) {
            return res.status(400).json({ success: false, message: 'Cannot transfer to yourself' });
        }

        // Check balance
        const walletField = currency === 'USD' ? 'USD' : 'IQD';
        if (sender.wallet[walletField] < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        // Use session for atomic transaction
        const session = await require('mongoose').startSession();
        session.startTransaction();

        try {
            // Deduct from sender
            sender.wallet[walletField] -= amount;
            await sender.save({ session });

            // Add to recipient
            recipient.wallet[walletField] += amount;
            await recipient.save({ session });

            // Create transaction for sender (sent)
            const senderTx = new Transaction({
                userId: sender.userId,
                type: 'transfer_sent',
                amount,
                currency,
                status: 'completed',
                transfer: {
                    to: recipient.userId,
                    note
                },
                balanceBefore: sender.wallet[walletField] + amount,
                balanceAfter: sender.wallet[walletField]
            });
            await senderTx.save({ session });

            // Create transaction for recipient (received)
            const recipientTx = new Transaction({
                userId: recipient.userId,
                type: 'transfer_received',
                amount,
                currency,
                status: 'completed',
                transfer: {
                    from: sender.userId,
                    note
                },
                balanceBefore: recipient.wallet[walletField] - amount,
                balanceAfter: recipient.wallet[walletField]
            });
            await recipientTx.save({ session });

            await session.commitTransaction();
            session.endSession();

            // Notifications
            const senderNotification = new Notification({
                userId: sender.userId,
                title: '📤 تم إرسال الرصيد',
                message: `تم إرسال ${amount} ${currency} إلى ${recipient.firstName} ${recipient.lastName}`,
                type: 'payment',
                data: { transactionId: senderTx.transactionId, recipientId }
            });
            await senderNotification.save();

            const recipientNotification = new Notification({
                userId: recipient.userId,
                title: '📥收到了转入',
                message: `收到了 ${amount} ${currency} من ${sender.firstName} ${sender.lastName}`,
                type: 'payment',
                data: { transactionId: recipientTx.transactionId, senderId: sender.userId }
            });
            await recipientNotification.save();

            res.json({
                success: true,
                message: 'Transfer completed successfully',
                data: {
                    transaction: senderTx,
                    recipient: {
                        userId: recipient.userId,
                        name: `${recipient.firstName} ${recipient.lastName}`
                    }
                }
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (error) {
        console.error('Transfer Error:', error);
        res.status(500).json({ success: false, message: 'Transfer failed' });
    }
});

// ==================== WITHDRAWAL REQUEST ====================
router.post('/withdraw', authenticateToken, async (req, res) => {
    try {
        const { amount, currency = 'IQD', method, accountDetails } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        const user = await User.findOne({ userId: req.user.userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check balance
        const walletField = currency === 'USD' ? 'USD' : 'IQD';
        if (user.wallet[walletField] < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        // Deduct from available balance
        user.wallet[walletField] -= amount;
        await user.save();

        // Create transaction
        const transaction = new Transaction({
            userId: user.userId,
            type: 'withdrawal',
            amount,
            currency,
            status: 'pending',
            metadata: { method, accountDetails },
            balanceBefore: user.wallet[walletField] + amount,
            balanceAfter: user.wallet[walletField],
            ipAddress: req.ip
        });
        await transaction.save();

        // Notify admin
        const admins = await User.find({ role: 'admin', isActive: true });
        for (const admin of admins) {
            const notification = new Notification({
                userId: admin.userId,
                title: '💸 طلب سحب جديد',
                message: `${user.firstName} طلب سحب ${amount} ${currency}`,
                type: 'payment',
                data: { transactionId: transaction.transactionId }
            });
            await notification.save();
        }

        res.status(201).json({
            success: true,
            message: 'Withdrawal request submitted',
            data: { transaction }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Withdrawal failed' });
    }
});

// ==================== PURCHASE BOOK ====================
router.post('/purchase', authenticateToken, async (req, res) => {
    try {
        const { bookId, orderId, printSpecs } = req.body;

        const user = await User.findOne({ userId: req.user.userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // For digital purchase, deduct from wallet
        // For print orders, create order
        const Book = require('./db').Book;
        const book = await Book.findOne({ bookId });
        
        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        const currency = 'IQD';
        const price = book.price.IQD * (1 - book.discount / 100);

        // Check balance
        if (user.wallet.IQD < price) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        // Deduct from wallet
        user.wallet.IQD -= price;
        user.stats.totalSpent += price;
        await user.save();

        // Create transaction
        const transaction = new Transaction({
            userId: user.userId,
            type: 'purchase',
            amount: price,
            currency,
            status: 'completed',
            orderId,
            balanceBefore: user.wallet.IQD + price,
            balanceAfter: user.wallet.IQD
        });
        await transaction.save();

        // Update book stats
        book.purchases += 1;
        await book.save();

        res.json({
            success: true,
            message: 'Purchase completed',
            data: {
                transaction,
                book: { bookId: book.bookId, title: book.title }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Purchase failed' });
    }
});

// ==================== GET PENDING DEPOSITS (Admin) ====================
router.get('/pending-deposits', authenticateToken, requireRole(ROLES.ADMIN), async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        
        const query = { type: 'deposit', status: 'pending' };
        const total = await Transaction.countDocuments(query);
        const deposits = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Get user info for each deposit
        const userIds = deposits.map(d => d.userId);
        const users = await User.find({ userId: { $in: userIds } });
        const userMap = {};
        users.forEach(u => { userMap[u.userId] = u; });

        const depositsWithUsers = deposits.map(d => ({
            ...d.toObject(),
            user: userMap[d.userId] ? {
                userId: userMap[d.userId].userId,
                name: `${userMap[d.userId].firstName} ${userMap[d.userId].lastName}`,
                email: userMap[d.userId].email
            } : null
        }));

        res.json({
            success: true,
            data: {
                deposits: depositsWithUsers,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get pending deposits' });
    }
});

// ==================== FINANCIAL STATS (Admin) ====================
router.get('/stats', authenticateToken, requireRole(ROLES.ADMIN), async (req, res) => {
    try {
        const totalTransactions = await Transaction.countDocuments();
        const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
        
        // Calculate total revenue (approved deposits)
        const approvedDeposits = await Transaction.aggregate([
            { $match: { type: 'deposit', status: 'approved' } },
            { $group: { _id: null, totalIQD: { $sum: { $cond: [{ $eq: ['$currency', 'IQD'] }, '$amount', 0] } }, totalUSD: { $sum: { $cond: [{ $eq: ['$currency', 'USD'] }, '$amount', 0] } } } }
        ]);

        res.json({
            success: true,
            data: {
                totalTransactions,
                pendingTransactions,
                totalRevenue: {
                    IQD: approvedDeposits[0]?.totalIQD || 0,
                    USD: approvedDeposits[0]?.totalUSD || 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get stats' });
    }
});

module.exports = router;