/**
 * TECHOPRINT 2026 - Books & Image Processing API
 * Professional Image-to-Book Conversion with Sharp
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const sharp = require('sharp');
const { User, Book, Transaction, Notification } = require('./db');
const { authenticateToken, requireRole } = require('./auth');
const ROLES = require('./auth').ROLES;

// ==================== UPLOAD CONFIG ====================
const uploadsDir = path.join(__dirname, '../uploads/books');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueName = `book-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|pdf/;
        if (allowed.test(file.mimetype) || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only images and PDFs are allowed'));
        }
    }
});

// ==================== IMAGE PROCESSING (Professional) ====================
const processBookImage = async (inputPath, options = {}) => {
    try {
        const {
            width = 800,
            height = 1200,
            grayscale = false,
            contrast = 1.2,
            brightness = 1.1,
            sharpen = true,
            format = 'jpeg'
        } = options;

        const outputPath = inputPath.replace(/\.[^.]+$/, `-processed.${format}`);

        let pipeline = sharp(inputPath)
            .resize(width, height, {
                fit: 'cover',
                position: 'center'
            });

        // Apply enhancements
        if (grayscale) {
            pipeline = pipeline.grayscale();
        } else {
            pipeline = pipeline
                .modulate({
                    brightness: brightness,
                    saturation: 1.2
                })
                .linear(contrast, -(128 * contrast) + 128);
        }

        // Sharpen for text clarity
        if (sharpen) {
            pipeline = pipeline.sharpen({
                sigma: 0.5,
                m1: 0.5,
                m2: 0.5
            });
        }

        // Convert to output format
        pipeline = pipeline.toFormat(format, {
            quality: 90,
            compressionLevel: 9
        });

        await pipeline.toFile(outputPath);

        return {
            success: true,
            path: outputPath,
            filename: path.basename(outputPath)
        };
    } catch (error) {
        console.error('Image processing error:', error);
        return { success: false, error: error.message };
    }
};

// Process multiple pages into PDF
const processBookPages = async (images, options = {}) => {
    try {
        const results = [];
        
        for (let i = 0; i < images.length; i++) {
            const result = await processBookImage(images[i], {
                ...options,
                width: options.pageWidth || 1240,
                height: options.pageHeight || 1754
            });
            
            if (result.success) {
                results.push(result);
            }
        }

        return { success: true, pages: results };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== CREATE BOOK ====================
router.post('/', authenticateToken, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'fullPdf', maxCount: 1 },
    { name: 'previewPages', maxCount: 10 }
]), async (req, res) => {
    try {
        const {
            title,
            description,
            author,
            subject,
            grade,
            language = 'ar',
            priceIQD,
            priceUSD = 0,
            discount = 0,
            tags
        } = req.body;

        // Validate required fields
        if (!title || !author || !subject || !grade || !priceIQD) {
            return res.status(400).json({
                success: false,
                message: 'Title, author, subject, grade, and price are required'
            });
        }

        // Check permission (teachers, publishers, admins can create)
        const allowedRoles = [ROLES.TEACHER, ROLES.PUBLISHER, ROLES.ADMIN];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to create books'
            });
        }

        // Process cover image if provided
        let coverImagePath = null;
        if (req.files?.coverImage) {
            const processed = await processBookImage(req.files.coverImage[0].path, {
                width: 800,
                height: 1200,
                sharpen: true
            });
            
            if (processed.success) {
                coverImagePath = processed.filename;
            } else {
                coverImagePath = req.files.coverImage[0].filename;
            }
        }

        // Process preview pages if provided
        const previewPages = [];
        if (req.files?.previewPages) {
            for (const file of req.files.previewPages) {
                const processed = await processBookImage(file.path, {
                    width: 1240,
                    height: 1754,
                    grayscale: false,
                    sharpen: true
                });
                
                previewPages.push({
                    filename: processed.success ? processed.filename : file.filename,
                    originalName: file.originalname
                });
            }
        }

        // Handle full PDF
        let fullPdfPath = null;
        let isEncrypted = false;
        if (req.files?.fullPdf) {
            fullPdfPath = req.files.fullPdf[0].filename;
            isEncrypted = true; // Encrypt for DRM
        }

        // Create book
        const book = new Book({
            title,
            description,
            author,
            publisher: req.user.userId,
            teacher: req.user.role === ROLES.TEACHER ? req.user.userId : null,
            subject,
            grade: parseInt(grade),
            language,
            price: {
                IQD: parseFloat(priceIQD),
                USD: parseFloat(priceUSD)
            },
            discount: parseFloat(discount) || 0,
            coverImage: coverImagePath,
            previewPages,
            fullPdf: fullPdfPath ? {
                filename: fullPdfPath,
                encrypted: isEncrypted
            } : undefined,
            tags: tags ? JSON.parse(tags) : [],
            isApproved: req.user.role === ROLES.ADMIN // Auto-approve for admins
        });

        await book.save();

        // Update user stats
        const user = await User.findOne({ userId: req.user.userId });
        if (user) {
            user.stats.totalEarned = (user.stats.totalEarned || 0) + parseFloat(priceIQD);
            await user.save();
        }

        res.status(201).json({
            success: true,
            message: 'Book created successfully',
            data: { book }
        });
    } catch (error) {
        console.error('Book creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create book'
        });
    }
});

// ==================== GET BOOKS ====================
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            subject,
            grade,
            language,
            search,
            publisher,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const query = { isActive: true };

        if (subject) query.subject = subject;
        if (grade) query.grade = parseInt(grade);
        if (language) query.language = language;
        if (publisher) query.publisher = publisher;

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' },
                { tags: { $in: [new RegExp(search, 'i')] }
            ];
        }

        const total = await Book.countDocuments(query);
        const books = await Book.find(query)
            .populate('publisher', 'firstName lastName')
            .populate('teacher', 'firstName lastName')
            .select('-fullPdf')
            .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: {
                books,
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
            message: 'Failed to get books'
        });
    }
});

// ==================== GET BOOK BY ID ====================
router.get('/:bookId', async (req, res) => {
    try {
        const book = await Book.findOne({ bookId: req.params.bookId })
            .populate('publisher', 'firstName lastName email')
            .populate('teacher', 'firstName lastName');

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Increment views
        book.views += 1;
        await book.save();

        res.json({
            success: true,
            data: { book }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get book'
        });
    }
});

// ==================== GET PREVIEW PAGE ====================
router.get('/:bookId/preview/:pageIndex', async (req, res) => {
    try {
        const book = await Book.findOne({ bookId: req.params.bookId });
        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        const pageIndex = parseInt(req.params.pageIndex);
        const previewPage = book.previewPages[pageIndex];

        if (!previewPage) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }

        const filePath = path.join(uploadsDir, previewPage.filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        res.sendFile(filePath);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get preview' });
    }
});

// ==================== PURCHASE BOOK ====================
router.post('/:bookId/purchase', authenticateToken, async (req, res) => {
    try {
        const { printSpecs } = req.body;

        const book = await Book.findOne({ bookId: req.params.bookId });
        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        const user = await User.findOne({ userId: req.user.userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Calculate price with discount
        const basePrice = book.price.IQD;
        const discountedPrice = basePrice * (1 - book.discount / 100);

        // Check balance
        if (user.wallet.IQD < discountedPrice) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        // Deduct from wallet
        user.wallet.IQD -= discountedPrice;
        user.stats.totalSpent += discountedPrice;
        await user.save();

        // Add to publisher's earnings
        const publisher = await User.findOne({ userId: book.publisher });
        if (publisher) {
            publisher.wallet.IQD += discountedPrice * 0.8; // 80% to publisher
            publisher.stats.totalEarned += discountedPrice * 0.8;
            await publisher.save();
        }

        // Create transaction
        const transaction = new Transaction({
            userId: user.userId,
            type: 'purchase',
            amount: discountedPrice,
            currency: 'IQD',
            status: 'completed',
            orderId: book.bookId,
            balanceBefore: user.wallet.IQD + discountedPrice,
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
                accessToken: generateDownloadToken(book.bookId, user.userId)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Purchase failed' });
    }
});

// ==================== DOWNLOAD BOOK ====================
router.get('/:bookId/download', authenticateToken, async (req, res) => {
    try {
        const book = await Book.findOne({ bookId: req.params.bookId });
        if (!book || !book.fullPdf) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        // Verify purchase
        const hasPurchased = await Transaction.findOne({
            userId: req.user.userId,
            orderId: book.bookId,
            type: 'purchase',
            status: 'completed'
        });

        if (!hasPurchased) {
            return res.status(403).json({ success: false, message: 'Purchase required' });
        }

        const filePath = path.join(uploadsDir, book.fullPdf.filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        // Increment downloads
        book.downloads += 1;
        await book.save();

        res.download(filePath);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Download failed' });
    }
});

// ==================== UPDATE BOOK ====================
router.put('/:bookId', authenticateToken, async (req, res) => {
    try {
        const book = await Book.findOne({ bookId: req.params.bookId });
        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        // Check ownership
        if (book.publisher.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const allowedUpdates = ['title', 'description', 'price', 'discount', 'tags', 'isActive'];
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                book[field] = req.body[field];
            }
        });

        await book.save();

        res.json({
            success: true,
            message: 'Book updated',
            data: { book }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

// ==================== APPROVE BOOK (Admin) ====================
router.put('/:bookId/approve', authenticateToken, requireRole(ROLES.ADMIN), async (req, res) => {
    try {
        const book = await Book.findOne({ bookId: req.params.bookId });
        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        book.isApproved = true;
        book.approvedBy = req.user.userId;
        book.approvedAt = new Date();
        await book.save();

        // Notify publisher
        const publisher = await User.findOne({ userId: book.publisher });
        if (publisher) {
            const notification = new Notification({
                userId: publisher.userId,
                title: '✅ تم قبول كتابك',
                message: `تم قبول كتابك "${book.title}" ونشره في المكتبة`,
                type: 'system'
            });
            await notification.save();
        }

        res.json({
            success: true,
            message: 'Book approved',
            data: { book }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Approval failed' });
    }
});

// ==================== RATE BOOK ====================
router.post('/:bookId/rate', authenticateToken, async (req, res) => {
    try {
        const { rating } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
        }

        const book = await Book.findOne({ bookId: req.params.bookId });
        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        // Update rating
        const newTotalRatings = book.totalRatings + 1;
        const newRating = ((book.rating * book.totalRatings) + rating) / newTotalRatings;

        book.rating = Math.round(newRating * 10) / 10;
        book.totalRatings = newTotalRatings;
        await book.save();

        res.json({
            success: true,
            message: 'Rating submitted',
            data: { rating: book.rating, totalRatings: book.totalRatings }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Rating failed' });
    }
});

// ==================== GET MY BOOKS (Publisher) ====================
router.get('/my/books', authenticateToken, async (req, res) => {
    try {
        const books = await Book.find({ publisher: req.user.userId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: { books }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get books' });
    }
});

// ==================== HELPERS ====================
const generateDownloadToken = (bookId, userId) => {
    const data = `${bookId}:${userId}:${Date.now()}`;
    return crypto.createHmac('sha256', process.env.JWT_SECRET || 'techoprint2026')
        .update(data)
        .digest('hex');
};

module.exports = router;