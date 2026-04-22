/**
 * TECHOPRINT 2026 - Logistics & Delivery System
 * Interactive Iraq Maps & Live GPS Tracking
 */

const express = require('express');
const router = express.Router();
const { User, Order, DeliveryStaff, Notification } = require('./db');
const { authenticateToken, requireRole } = require('./auth');
const ROLES = require('./auth').ROLES;

// ==================== IRAQ CITIES & LOCATIONS ====================
const IRAQ_LOCATIONS = {
    baghdad: {
        name: 'بغداد',
        nameEn: 'Baghdad',
        coordinates: [44.3661, 33.3152],
        districts: ['الرصافة', ' الكرخ', 'أبو غريب', 'التاجي', 'المدائن', 'حي القاهرة', 'المنصور', 'الأعظمية', 'الشعب', 'المعامل']
    },
    basra: {
        name: 'البصرة',
        nameEn: 'Basra',
        coordinates: [47.7804, 30.5085],
        districts: ['المدينة', 'الشاطئ', 'القرنة', 'الفاو', 'ابو الخصيب', 'الشعيبة', 'خور الزبير']
    },
    erbil: {
        name: 'أربيل',
        nameEn: 'Erbil',
        coordinates: [43.9729, 36.5657],
        districts: ['السرعة', 'عينكاوا', 'روزبار', '宿市', 'هيران', 'بادينا', 'كرميق']
    },
    sulaymaniyah: {
        name: 'السليمانية',
        nameEn: 'Sulaymaniyah',
        coordinates: [45.4209, 35.5614],
        districts: ['سيفلي', 'قادر را', 'السعدية', '宿市', 'كرميان', 'チョproch', 'رابرين']
    },
    mosul: {
        name: 'الموصل',
        nameEn: 'Mosul',
        coordinates: [43.1505, 36.3400],
        districts: ['الموصل القديمة', 'حمام العليل', 'الشيخ يونس', 'البيجات', 'بعويزة', 'خازر']
    },
    Kirkuk: {
        name: 'كركوك',
        nameEn: 'Kirkuk',
        coordinates: [44.3647, 35.4722],
        districts: ['رايس', 'تاسلي', 'الحي الصناعي', 'ال宿نز', 'قوشان', 'بجركير']
    },
    najaf: {
        name: 'النجف',
        nameEn: 'Najaf',
        coordinates: [44.3260, 31.9920],
        districts: ['المدينة', 'الحنانة', 'الوارث', 'الكوفة', 'جرف الصخر']
    },
    karbala: {
        name: 'كربلاء',
        nameEn: 'Karbala',
        coordinates: [44.0247, 32.6160],
        districts: ['المدينة', 'الهندية', 'الوفاء', 'بئر السبيل', 'عين التمر']
    },
    homs: {
        name: 'حمص',
        nameEn: 'Homs',
        coordinates: [36.7139, 34.7354],
        districts: ['المدينة', 'باب السباع', 'الحميدية', 'القصور', 'كلدانة']
    },
    damascus: {
        name: 'دمشق',
        nameEn: 'Damascus',
        coordinates: [36.2765, 33.5138],
        districts: ['المزة', 'المالكي', 'القصاع', 'أبو رمانة', 'ركن الدين', 'باب توما', 'الحمراء']
    }
};

// ==================== CREATE ORDER ====================
router.post('/orders', authenticateToken, async (req, res) => {
    try {
        const {
            items,
            type = 'print',
            delivery,
            printSpecs
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Order items required' });
        }

        const user = await User.findOne({ userId: req.user.userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Calculate pricing
        const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        const deliveryFee = delivery ? 5000 : 0; // 5000 IQD delivery
        const total = subtotal + deliveryFee;

        // Create order
        const order = new Order({
            userId: user.userId,
            type,
            items,
            subtotal,
            deliveryFee,
            total,
            currency: 'IQD',
            status: 'pending',
            delivery: delivery ? {
                address: delivery.address,
                location: delivery.location || null,
                preferredTime: delivery.preferredTime,
                recipientName: delivery.recipientName || `${user.firstName} ${user.lastName}`,
                recipientPhone: delivery.recipientPhone || user.phone
            } : undefined,
            printSpecs: printSpecs || {
                paperSize: 'A4',
                paperType: 'standard',
                binding: 'none',
                colorMode: 'black_white',
                copies: 1
            }
        });
        await order.save();

        // Update user stats
        user.stats.totalOrders += 1;
        await user.save();

        // Notify admins
        const admins = await User.find({ role: 'admin', isActive: true });
        for (const admin of admins) {
            const notification = new Notification({
                userId: admin.userId,
                title: '📦 طلب جديد',
                message: `طلب جديد #${order.orderId} - ${total} IQD`,
                type: 'order',
                data: { orderId: order.orderId },
                link: `/admin/orders/${order.orderId}`
            });
            await notification.save();
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: { order }
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ success: false, message: 'Failed to create order' });
    }
});

// ==================== GET ORDERS ====================
router.get('/orders', authenticateToken, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        let query = { userId: req.user.userId };
        if (status && status !== 'all') {
            query.status = status;
        }

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get orders' });
    }
});

// ==================== GET ORDER BY ID ====================
router.get('/orders/:orderId', authenticateToken, async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check access
        if (order.userId !== req.user.userId && req.user.role !== 'admin' && req.user.role !== 'delivery') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.json({ success: true, data: { order } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get order' });
    }
});

// ==================== UPDATE ORDER STATUS ====================
router.put('/orders/:orderId/status', authenticateToken, async (req, res) => {
    try {
        const { status, note } = req.body;
        
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Validate status transition
        const validStatuses = ['pending', 'confirmed', 'processing', 'printing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        // Update status
        order.status = status;
        order.statusHistory.push({
            status,
            timestamp: new Date(),
            note,
            updatedBy: req.user.userId
        });

        // Handle specific status changes
        if (status === 'delivered') {
            order.tracking.actualDelivery = new Date();
        }

        await order.save();

        // Notify user
        const notification = new Notification({
            userId: order.userId,
            title: '📦 تحديث الطلب',
            message: `طلبك #${order.orderId} تم تحديثه إلى: ${status}`,
            type: 'order',
            data: { orderId: order.orderId, status }
        });
        await notification.save();

        res.json({
            success: true,
            message: 'Order status updated',
            data: { order }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update order' });
    }
});

// ==================== ASSIGN DELIVERY STAFF ====================
router.put('/orders/:orderId/assign', authenticateToken, requireRole(ROLES.ADMIN, ROLES.DELIVERY), async (req, res) => {
    try {
        const { staffId } = req.body;
        
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (staffId) {
            const staff = await DeliveryStaff.findOne({ staffId });
            if (!staff) {
                return res.status(404).json({ success: false, message: 'Staff not found' });
            }
            order.assignedTo = staff.userId;
            order.assignedAt = new Date();
        } else {
            order.assignedTo = null;
            order.assignedAt = null;
        }

        await order.save();

        res.json({
            success: true,
            message: 'Delivery staff assigned',
            data: { order }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to assign staff' });
    }
});

// ==================== GET ALL ACTIVE DELIVERIES (Admin) ====================
router.get('/active-deliveries', authenticateToken, requireRole(ROLES.ADMIN), async (req, res) => {
    try {
        const orders = await Order.find({
            status: { $in: ['out_for_delivery', 'processing', 'printing', 'ready'] }
        })
            .populate('assignedTo', 'firstName lastName phone')
            .sort({ assignedAt: -1 });

        res.json({ success: true, data: { orders } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get active deliveries' });
    }
});

// ==================== UPDATE GPS LOCATION (Delivery Staff) ====================
router.post('/location', authenticateToken, requireRole(ROLES.DELIVERY), async (req, res) => {
    try {
        const { coordinates, address } = req.body;

        if (!coordinates || coordinates.length !== 2) {
            return res.status(400).json({ success: false, message: 'Invalid coordinates' });
        }

        // Update delivery staff location
        const staff = await DeliveryStaff.findOne({ userId: req.user.userId });
        if (staff) {
            staff.currentLocation = {
                type: 'Point',
                coordinates: coordinates,
                lastUpdated: new Date(),
                isOnline: true
            };
            await staff.save();
        }

        // Update user location
        const user = await User.findOne({ userId: req.user.userId });
        if (user) {
            user.currentLocation = {
                type: 'Point',
                coordinates: coordinates,
                address: address,
                lastUpdated: new Date()
            };
            await user.save();
        }

        res.json({ success: true, message: 'Location updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update location' });
    }
});

// ==================== GET DELIVERY STAFF LOCATIONS ====================
router.get('/staff-locations', authenticateToken, async (req, res) => {
    try {
        const staff = await DeliveryStaff.find({
            'currentLocation.isOnline': true,
            status: { $in: ['available', 'busy'] }
        }).populate('userId', 'firstName lastName phone');

        const locations = staff.map(s => ({
            staffId: s.staffId,
            name: s.userId ? `${s.userId.firstName} ${s.userId.lastName}` : 'Unknown',
            phone: s.userId?.phone,
            coordinates: s.currentLocation.coordinates,
            status: s.status,
            currentDelivery: s.currentDelivery,
            lastUpdated: s.currentLocation.lastUpdated
        }));

        res.json({ success: true, data: { locations } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get staff locations' });
    }
});

// ==================== SEARCH LOCATIONS (Iraq Map) ====================
router.get('/locations/search', async (req, res) => {
    try {
        const { q, city } = req.query;
        
        let results = [];

        if (city && IRAQ_LOCATIONS[city]) {
            const cityData = IRAQ_LOCATIONS[city];
            results.push({
                type: 'city',
                name: cityData.name,
                nameEn: cityData.nameEn,
                coordinates: cityData.coordinates,
                districts: cityData.districts
            });

            // Search districts
            if (q) {
                const districts = cityData.districts.filter(d => 
                    d.includes(q) || d.toLowerCase().includes(q.toLowerCase())
                );
                results = results.concat(districts.map(d => ({
                    type: 'district',
                    name: d,
                    parentCity: cityData.name,
                    parentCityEn: cityData.nameEn
                })));
            }
        } else {
            // Search all cities
            Object.entries(IRAQ_LOCATIONS).forEach(([key, cityData]) => {
                if (cityData.name.includes(q) || cityData.nameEn.toLowerCase().includes(q?.toLowerCase())) {
                    results.push({
                        type: 'city',
                        name: cityData.name,
                        nameEn: cityData.nameEn,
                        coordinates: cityData.coordinates,
                        districts: cityData.districts
                    });
                }
            });
        }

        res.json({ success: true, data: { results } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Search failed' });
    }
});

// ==================== GET IRAQ MAP DATA ====================
router.get('/iraq-map', async (req, res) => {
    try {
        const cities = Object.entries(IRAQ_LOCATIONS).map(([key, data]) => ({
            id: key,
            ...data
        }));

        res.json({
            success: true,
            data: {
                cities,
                defaultCenter: [44.3661, 33.3152], // Baghdad
                defaultZoom: 6
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get map data' });
    }
});

// ==================== REVERSE GEOCODING ====================
router.post('/reverse-geocode', async (req, res) => {
    try {
        const { coordinates } = req.body;

        if (!coordinates || coordinates.length !== 2) {
            return res.status(400).json({ success: false, message: 'Invalid coordinates' });
        }

        const [lng, lat] = coordinates;

        // Simple reverse geocoding - find nearest city
        let nearestCity = null;
        let minDistance = Infinity;

        Object.entries(IRAQ_LOCATIONS).forEach(([key, city]) => {
            const [cityLng, cityLat] = city.coordinates;
            const distance = Math.sqrt(Math.pow(lng - cityLng, 2) + Math.pow(lat - cityLat, 2));
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestCity = {
                    ...city,
                    id: key,
                    distance
                };
            }
        });

        // If within 100km of a city, return it
        if (nearestCity && minDistance < 2) { // ~2 degrees ~200km
            res.json({
                success: true,
                data: {
                    city: nearestCity.name,
                    cityEn: nearestCity.nameEn,
                    coordinates,
                    withinCity: true
                }
            });
        } else {
            // Return general region
            res.json({
                success: true,
                data: {
                    region: 'العراق',
                    regionEn: 'Iraq',
                    coordinates,
                    withinCity: false
                }
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Geocoding failed' });
    }
});

// ==================== DELIVERY STAFF REGISTRATION ====================
router.post('/register-staff', authenticateToken, async (req, res) => {
    try {
        const { vehicle, coverageArea, coverageRadius = 10000 } = req.body;

        const existing = await DeliveryStaff.findOne({ userId: req.user.userId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Already registered as delivery staff' });
        }

        const staff = new DeliveryStaff({
            userId: req.user.userId,
            vehicle,
            coverageArea: coverageArea ? {
                type: 'Point',
                coordinates: coverageArea,
                radius: coverageRadius
            } : undefined
        });
        await staff.save();

        res.status(201).json({
            success: true,
            message: 'Registered as delivery staff',
            data: { staff }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// ==================== UPDATE DELIVERY STATUS ====================
router.put('/delivery-status', authenticateToken, requireRole(ROLES.DELIVERY), async (req, res) => {
    try {
        const { status } = req.body;

        const staff = await DeliveryStaff.findOne({ userId: req.user.userId });
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }

        staff.status = status;
        if (status === 'offline') {
            staff.currentLocation.isOnline = false;
        }
        await staff.save();

        res.json({ success: true, message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
});

module.exports = router;