# 👑 TECHOPRINT 2026 - THE SOVEREIGN ENGINE 👑

## Global Print-on-Demand Platform for Iraq Education

![Version](https://img.shields.io/badge/version-2026.1.0-gold)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-MIT-gold)

---

## 🏛️ THE 9 MASTER DASHBOARDS

| # | Role | Dashboard | Key Features |
|---|------|-----------|--------------|
| 1 | **Student** | 🎓 Student Portal | Library access, orders, wallet |
| 2 | **Teacher** | 📚 Teacher Hub | Create books, upload photos, student management |
| 3 | **Designer** | 🎨 Design Studio | Custom designs, portfolio, sales |
| 4 | **Publisher** | 📖 Publisher Panel | Book management, earnings, analytics |
| 5 | **Staff** | 🚚 Delivery Tracker | GPS tracking, route optimization, live map |
| 6 | **AI Operator** | 🤖 AI Command Center | Analytics, predictions, automation |
| 7 | **Admin** | 👑 Royal Control | Full system control, approvals, finance |
| 8 | **Global Library** | 🌍 Library Admin | Cross-regional books, translations |
| 9 | **Guest** | 👤 Visitor View | Browse only, no purchase |

---

## 🚀 QUICK START

```bash
# Navigate to project
cd D:\TECHOPRINT_2026

# Install dependencies
npm install

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

---

## 📁 PROJECT STRUCTURE

```
TECHOPRINT_2026/
├── server.js              # Main Express + Socket.io server
├── package.json           # Dependencies & scripts
├── .env                   # Environment variables
│
├── api/                   # Backend API Routes
│   ├── db.js              # MongoDB Schemas (7 models)
│   ├── auth.js            # JWT Authentication (6 roles)
│   ├── finance.js         # Wallet, OCR, P2P transfers
│   ├── logistics.js       # Iraq Maps, GPS tracking
│   └── books.js           # Book management, Sharp processing
│
├── public/                # Frontend Assets
│   ├── index.html         # Royal Galaxy UI
│   ├── style.css          # Royal Gold Theme
│   ├── app.js             # WebSocket client
│   ├── i18n.js            # Localization (AR/KU/EN)
│   └── locales/           # Translation files
│
├── uploads/               # File storage
│   ├── receipts/         # Receipt uploads
│   ├── books/            # Book files
│   └── profiles/         # User avatars
│
└── backups/               # Auto database backups
```

---

## 🛡️ SECURITY FEATURES

- **AES-256 Encryption** for all sensitive data
- **JWT Authentication** with role-based access
- **Rate Limiting** (1000 requests/15min)
- **Signed URLs** for secure file access
- **Account Lockout** after 5 failed attempts
- **Input Validation** on all endpoints

---

## 💰 FINANCIAL SYSTEM

### Wallet Currencies
- **IQD** - Iraqi Dinar (primary)
- **USD** - US Dollar (secondary)

### Operations
- 📥 Deposit with OCR receipt scanning
- 📤 Withdrawal requests
- 🔄 P2P instant transfers
- 🛒 Book purchases
- 💵 Publisher earnings (80%)

---

## 🗺️ LOGISTICS & DELIVERY

### Iraq Cities Covered
- Baghdad (بغداد)
- Basra (البصرة)
- Erbil (أربيل)
- Sulaymaniyah (السليمانية)
- Mosul (الموصل)
- Kirkuk (كركوك)
- Najaf (النجف)
- Karbala (كربلاء)

### Features
- 📍 Live GPS tracking for delivery staff
- 🗺️ Interactive OpenStreetMap integration
- 🚚 Real-time delivery status updates
- 📱 WebSocket notifications

---

## 🖼️ IMAGE-TO-BOOK PROCESSING

Using **Sharp** library for professional image processing:

```javascript
// Auto-enhance uploaded images
- Resize to standard dimensions (1240x1754)
- Contrast enhancement (1.2x)
- Brightness adjustment (1.1x)
- Text sharpening for clarity
- Format optimization (JPEG 90%)
```

---

## 🌐 LOCALIZATION

Three languages supported:
- **AR** - العربية (Default)
- **KU** - کوردی (Kurdish)
- **EN** - English

---

## 📦 DATABASE MODELS

| Model | Purpose |
|-------|---------|
| User | 6 roles, wallet, education info |
| Transaction | All financial operations |
| Book | E-books with preview pages |
| Order | Print/digital orders with tracking |
| Ticket | Support tickets system |
| DeliveryStaff | GPS-enabled delivery tracking |
| Notification | Real-time notifications |

---

## 🔌 WEBSOCKET EVENTS

| Event | Description |
|-------|-------------|
| `authenticate` | Socket authentication |
| `updateLocation` | GPS location updates |
| `trackOrder` | Order tracking room |
| `notification` | Real-time alerts |
| `newDeposit` | Admin deposit alerts |
| `orderUpdate` | Order status changes |

---

## 🛠️ DEPENDENCIES

| Package | Purpose |
|---------|---------|
| express | Web framework |
| mongoose | MongoDB ODM |
| socket.io | Real-time comms |
| sharp | Image processing |
| tesseract.js | OCR processing |
| chart.js | Analytics charts |
| jsonwebtoken | JWT auth |
| bcryptjs | Password hashing |
| multer | File uploads |
| helmet | Security headers |

---

## 👑 ROYAL INTERFACE FEATURES

- **Royal Gold Theme** (#D4AF37)
- **Dark Galaxy Background** (#000814)
- **Glassmorphism Effects**
- **Smooth Animations**
- **RTL Support** (Arabic)
- **Mobile Responsive**

---

## 🚀 API ENDPOINTS

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/profile
```

### Finance
```
GET  /api/finance/wallet
POST /api/finance/deposit
POST /api/finance/withdraw
POST /api/finance/transfer
GET  /api/finance/transactions
```

### Books
```
GET    /api/books
POST   /api/books
GET    /api/books/:id
POST   /api/books/:id/purchase
GET    /api/books/:id/download
```

### Logistics
```
POST /api/logistics/orders
GET  /api/logistics/orders
PUT  /api/logistics/orders/:id/status
POST /api/logistics/location
GET  /api/logistics/iraq-map
```

---

## 📝 ENVIRONMENT VARIABLES

Create `.env` file:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/techoprint2026
JWT_SECRET=your-super-secret-key
ENCRYPTION_KEY=your-32-char-encryption-key
NODE_ENV=development
```

---

## 👑 THE SOVEREIGN BUILD

**TECHOPRINT 2026** is built with:
- ❤️ Passion for education
- 💎 Royal craftsmanship
- 🌍 Global standards
- 🇮🇶 Iraqi soul

*"Building the future of printing, one book at a time"*

---

**© 2026 TECHOPRINT - All Rights Reserved**
