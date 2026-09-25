<div align="center">

# 🏠 INTRA DECOR
### *Luxury Home Decor, Interior Visualizer & E-Commerce Platform*

[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Safepay](https://img.shields.io/badge/Payments-Safepay%20Gateway-00D09C)](https://getsafepay.com/)
[![Nodemailer](https://img.shields.io/badge/Email-Nodemailer%20OTP-EA4335?logo=gmail&logoColor=white)](https://nodemailer.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Intra Decor** is an end-to-end modern full-stack web platform built for high-end home decoration, interior renovation, and architectural finishing. It blends an e-commerce marketplace with interactive room visualization tools, an AI design assistant, house renovation estimators, secure email OTP authentication, and automated payment gateways.

---

</div>

## 📑 Table of Contents
- [✨ Key Features](#-key-features)
  - [🎨 Interactive Visualizer Tools](#-interactive-visualizer-tools)
  - [🤖 AI Consultant & Smart Estimators](#-ai-consultant--smart-estimators)
  - [🛍️ E-Commerce & Checkout](#️-e-commerce--checkout)
  - [🔐 Security & Authentication](#-security--authentication)
  - [📦 Customer Dashboard & Order Tracking](#-customer-dashboard--order-tracking)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Architecture](#-project-architecture)
- [⚙️ Environment Variables Setup](#️-environment-variables-setup)
- [🚀 Quick Start Guide](#-quick-start-guide)
  - [Option A: One-Click Startup (Windows)](#option-a-one-click-startup-windows)
  - [Option B: Manual Startup (Step-by-Step)](#option-b-manual-startup-step-by-step)
- [📡 Comprehensive API Reference](#-comprehensive-api-reference)
- [🗺️ Frontend Routes & Pages](#️-frontend-routes--pages)
- [🗄️ Database Architecture & Fallback Storage](#️-database-architecture--fallback-storage)
- [🤝 Contributing & License](#-contributing--license)

---

## ✨ Key Features

### 🎨 Interactive Visualizer Tools
* **Real-time Paint Visualizer (`/paint`):**
  - Preview paint shades from top brands (*Dulux, Berger, Nippon, Master*).
  - Select individual walls (Left Wall, Center Accent Wall, Right Wall).
  - Dynamic lighting simulation with one click (**Daylight**, **Golden Hour Sunset**, **Night Ambience**).
  - **Custom Room Photo Upload:** Upload your own living room or bedroom photograph and apply paint tints dynamically to see the result before painting.
  - One-click *Add to Cart* directly from visualizer color swatches.
* **3D Room Designer (`/room-designer`):**
  - Mix and match tile designs, wall panels, luxury wallpapers, and paint shades inside styled room templates.

### 🤖 AI Consultant & Smart Estimators
* **Floating AI Consultant Modal:**
  - AI-driven conversational advisor for color palette pairings, lighting suggestions, and interior styles.
  - Suggested prompts for living rooms, master bedrooms, modern kitchens, and exterior facades.
* **Whole-House Project Cost Estimator Modal:**
  - Input home size in **Square Feet** or **Marlas** (5 Marla, 10 Marla, 1 Kanal, etc.).
  - Calculates paint can requirements (liters/gallons), tile boxes needed, wall panel counts, and estimated labor & material costs.

### 🛍️ E-Commerce & Checkout
* **Multi-Category Catalog:**
  - Dedicated pages for **Paints**, **Tiles**, **Wallpapers**, and **Wall Panels**.
  - Advanced search, price filtering, brand filtering, and real-time inventory stock checks.
* **Product Detail Page (`/product/:id`):**
  - High-resolution imagery, technical specifications, coverage calculator, customer reviews, and related product recommendations.
* **Cart & Checkout Suite (`/cart`, `/checkout`):**
  - Real-time subtotal, coupon discount, delivery charges calculation, and tax breakdown.
  - Multiple payment choices:
    - **Cash on Delivery (COD)**
    - **Safepay Online Payment Gateway** (`/payment/safepay`) with secure checkout redirect.
* **Professional Services Booking (`/services`):**
  - Hire certified painters, tile masons, wallpaper installers, and interior consultants.

### 🔐 Security & Authentication
* **Email OTP Verification (`/verify-otp`):**
  - 6-digit one-time password (OTP) sent via **Nodemailer SMTP** during signup to prevent fake accounts.
  - Temporary token authorization for unverified users.
* **JWT Authentication:**
  - Secure HTTP-only/Authorization header Bearer tokens with encrypted passwords using **bcryptjs**.
* **Role-Based Access Control:**
  - Protected customer dashboard and administrative API endpoints (`/api/admin`).

### 📦 Customer Dashboard & Order Tracking
* **Track Order (`/track-order`):**
  - Instant order status tracking via tracking ID with visual shipment milestones (*Placed ➔ Processing ➔ Shipped ➔ Delivered*).
* **Customer Dashboard (`/dashboard`):**
  - View past purchase history, downloaded invoices, saved wishlist items, active service appointments, and saved delivery addresses.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Description |
|---|---|
| **React 18** | High-performance component-driven user interface |
| **Vite 5** | Lightning-fast HMR build tool and dev server |
| **Tailwind CSS 3** | Utility-first responsive design system |
| **React Router DOM 6** | Declarative client-side routing & deep linking |
| **Lucide React** | Modern, accessible iconography |
| **Context API** | Lightweight global state (`AuthContext`, `CartContext`, `WishlistContext`) |

### Backend
| Technology | Description |
|---|---|
| **Node.js** | Scalable JavaScript runtime environment |
| **Express.js 4** | Robust RESTful API framework |
| **MySQL2 (Promise)** | Fast MySQL connection pooling & async queries |
| **JWT (jsonwebtoken)** | Secure stateless token generation & verification |
| **bcryptjs** | Salted hashing for user passwords |
| **Nodemailer** | Automated transactional emails & OTP delivery |
| **Multer** | Multipart form handling for room image uploads |
| **Cors & Dotenv** | Cross-Origin Resource Sharing & environment isolation |

---

## 📁 Project Architecture

```bash
intradecor-app/
├── client/                           # React Frontend Application (Vite)
│   ├── public/                       # Static public assets (images, logos, icons)
│   │   ├── assets/
│   │   │   ├── images/               # Curated paint, tile & panel image library
│   │   │   └── css/
│   │   └── uploads/                  # Uploaded user room images
│   ├── src/
│   │   ├── components/               # Reusable UI widgets
│   │   │   ├── AIConsultantModal.jsx # Floating AI design consultant
│   │   │   ├── Footer.jsx            # Global footer & newsletter signup
│   │   │   ├── HouseEstimatorModal.jsx# Renovation & material cost calculator
│   │   │   ├── Navbar.jsx            # Top bar with search, cart badge & profile
│   │   │   ├── NavLinks.jsx          # Category navigation links
│   │   │   └── ProductCard.jsx       # Universal product card with quick add
│   │   ├── context/                  # Global React Context providers
│   │   │   ├── AuthContext.jsx       # User auth state & token management
│   │   │   ├── CartContext.jsx       # Shopping cart operations & totals
│   │   │   └── WishlistContext.jsx   # Favorite items state
│   │   ├── pages/                    # 17 Main Page Components
│   │   │   ├── Home.jsx              # Landing page with hero & showcase
│   │   │   ├── PaintVisualizer.jsx   # Interactive 3D paint & lighting studio
│   │   │   ├── RoomDesigner.jsx      # Room decorator & material matcher
│   │   │   ├── Tiles.jsx             # Tiles product showcase & filters
│   │   │   ├── Wallpaper.jsx         # Wallpaper catalog
│   │   │   ├── WallPanels.jsx        # Decorative wall panels catalog
│   │   │   ├── Services.jsx          # Professional services booking page
│   │   │   ├── ProductDetail.jsx     # In-depth product view & review section
│   │   │   ├── Cart.jsx              # Shopping bag management
│   │   │   ├── Checkout.jsx          # Address, billing & payment selection
│   │   │   ├── PaymentSafepay.jsx    # Safepay payment gateway handler
│   │   │   ├── OrderSuccess.jsx      # Order confirmation & receipt summary
│   │   │   ├── TrackOrder.jsx        # Live order tracking page
│   │   │   ├── Login.jsx             # User login portal
│   │   │   ├── Signup.jsx            # User registration with email trigger
│   │   │   ├── VerifyOTP.jsx         # 6-digit email OTP verification screen
│   │   │   └── Dashboard.jsx         # User account overview & order history
│   │   ├── App.jsx                   # Central routing & layout assembly
│   │   ├── main.jsx                  # React DOM root entrypoint
│   │   └── index.css                 # Base Tailwind styles & typography
│   ├── index.html                    # Single Page Application HTML shell
│   ├── package.json                  # Frontend dependencies & scripts
│   ├── tailwind.config.js            # Tailwind theme tokens & color palettes
│   └── vite.config.js                # Vite config & API reverse proxy rules
│
├── server/                           # Node.js + Express Backend API
│   ├── config/
│   │   └── db.js                     # MySQL connection pool & failover logger
│   ├── database/
│   │   ├── data.json                 # Seed catalog & mock database records
│   │   └── store.js                  # Persistent in-memory & file storage fallback
│   ├── middleware/
│   │   └── auth.js                   # JWT token validation & admin protection
│   ├── routes/
│   │   ├── admin.js                  # Admin management routes (orders, products)
│   │   ├── ai.js                     # AI consultant recommendations endpoint
│   │   ├── auth.js                   # Login, signup, OTP send & verification
│   │   ├── cart.js                   # Server-side cart persistence
│   │   ├── general.js                # Services, contact, newsletter & favorites
│   │   ├── orders.js                 # Order creation, list & tracking status
│   │   ├── payments.js               # Safepay payment initialization & webhook
│   │   └── products.js               # Product catalog, categories & search
│   ├── utils/
│   │   └── mailer.js                 # Nodemailer transporter & email templates
│   ├── .env                          # Backend environment credentials
│   ├── package.json                  # Backend dependencies & scripts
│   ├── server.js                     # Express server bootstrapper & route binder
│   └── test_mail.js                  # SMTP email test script
│
├── package.json                      # Monorepo root scripts (`npm run client`, etc.)
├── start.bat                         # Windows one-click dual-server launcher
└── README.md                         # Comprehensive documentation
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the `server/` directory:

```env
# ===================================
# IntraDecor — Server Environment
# ===================================

# Server Configuration
PORT=5050
NODE_ENV=development

# MySQL Database (Local or Cloud)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=intradecorhome

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_2026

# Email Delivery (Gmail SMTP or SendGrid)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM="Intra Decor Home" <your_email@gmail.com>

# Notifications
ADMIN_EMAIL=your_email@gmail.com

# Frontend Origin (CORS Whitelist)
FRONTEND_URL=http://localhost:4173

# Safepay Payment Gateway (Optional / Sandbox)
SAFEPAY_API_KEY=sec_sandbox_example_key
SAFEPAY_SECRET=your_safepay_secret
SAFEPAY_ENV=sandbox
```

> **Note:** If MySQL is not running on your machine, Intra Decor automatically falls back to its built-in database store (`server/database/store.js`), ensuring zero development downtime!

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)
- **MySQL Server** (Optional: XAMPP, MySQL Workbench, or standalone MySQL service)

---

### Option A: One-Click Startup (Windows)
Double-click `start.bat` in the root folder, or execute in PowerShell:
```powershell
.\start.bat
```
*This simultaneously starts the backend on port `5050` and the frontend on port `4173`.*

---

### Option B: Manual Startup (Step-by-Step)

#### 1. Install All Dependencies
From the project root:
```bash
# Install backend packages
npm --prefix server install

# Install frontend packages
npm --prefix client install
```

#### 2. Start the Backend API
```bash
cd server
node server.js
```
*API will run at [http://localhost:5050/api](http://localhost:5050/api)*

#### 3. Start the Frontend Client
In a separate terminal:
```bash
cd client
npm run dev -- --host 0.0.0.0 --port 4173
```
*Open your browser and navigate to [http://localhost:4173](http://localhost:4173)*

---

## 📡 Comprehensive API Reference

All backend endpoints are prefixed with `/api`.

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/send-signup-otp` | Sends 6-digit OTP code to applicant's email | No |
| `POST` | `/api/auth/verify-signup-otp` | Validates OTP and registers the user account | No |
| `POST` | `/api/auth/login` | Authenticates email & password, returns JWT token | No |
| `GET` | `/api/auth/me` | Fetches current logged-in user profile | Bearer Token |
| `PUT` | `/api/auth/update-profile` | Updates user details (address, phone, name) | Bearer Token |

### 🎨 Products Catalog (`/api/products`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Get all products with optional filters (`category`, `brand`, `search`, `minPrice`, `maxPrice`) |
| `GET` | `/api/products/:id` | Get individual product specifications & details |
| `GET` | `/api/products/categories/list` | Get list of all available categories |
| `GET` | `/api/products/featured/list` | Fetch featured / best-seller products |

### 🛒 Cart Operations (`/api/cart`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cart` | Get current active cart items for authenticated user |
| `POST` | `/api/cart/add` | Add product to cart with quantity & custom attributes |
| `PUT` | `/api/cart/update` | Update item quantity |
| `DELETE` | `/api/cart/remove/:id` | Remove specific item from cart |
| `DELETE` | `/api/cart/clear` | Clear entire shopping bag |

### 📦 Orders & Tracking (`/api/orders`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/orders` | Place a new order (COD or Card) |
| `GET` | `/api/orders/my-orders` | Retrieve order history for logged-in user |
| `GET` | `/api/orders/track/:id` | Track shipment status by Tracking ID or Order ID |
| `GET` | `/api/orders/:id` | Get full invoice & itemized details for an order |

### 💳 Safepay Payments (`/api/payments`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/payments/safepay/create-tracker` | Initializes a Safepay checkout transaction & returns tracker token |
| `POST` | `/api/payments/safepay/verify` | Confirms payment signature & updates order status to 'Paid' |

### 🤖 AI Consultant (`/api/ai`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/consultant` | Generates smart color schemes, product pairings, and interior styling recommendations based on user prompts |

### 🔨 Services & Inquiries (`/api`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/services` | List all available professional installation services |
| `POST` | `/api/services/book` | Submit a service appointment request |
| `POST` | `/api/contact` | Submit contact / customer support message |
| `POST` | `/api/newsletter` | Subscribe email to promotion updates |
| `GET` | `/api/health` | System health check (MySQL status, version, uptime) |

---

## 🗺️ Frontend Routes & Pages

| Route Path | Page Component | Purpose |
|---|---|---|
| `/` | `Home.jsx` | Landing page, hero showcase, category tiles, testimonials |
| `/paint` | `PaintVisualizer.jsx` | 3D room lighting, custom wall painting, photo upload tint studio |
| `/room-designer` | `RoomDesigner.jsx` | Interactive material mixer (tiles + wall panels + paint) |
| `/tiles` | `Tiles.jsx` | Floor & wall tiles catalog with dimensions & finish filters |
| `/wallpaper` | `Wallpaper.jsx` | Textured, minimalist, floral & luxury wallpapers |
| `/wallpenals` | `WallPanels.jsx` | Fluted, acoustic, PVC, and wood wall panel collections |
| `/services` | `Services.jsx` | Professional home improvement painter & mason booking |
| `/product/:id` | `ProductDetail.jsx` | Detailed gallery, pricing, coverage calculator & reviews |
| `/cart` | `Cart.jsx` | Cart items, quantity controls, coupon promo code input |
| `/checkout` | `Checkout.jsx` | Shipping address, payment selector (COD / Safepay) |
| `/payment/safepay`| `PaymentSafepay.jsx` | Safepay gateway checkout & return handler |
| `/order-success` | `OrderSuccess.jsx` | Confirmation screen with tracking code and order summary |
| `/track-order` | `TrackOrder.jsx` | Real-time visual package tracking status |
| `/login` | `Login.jsx` | Customer login screen |
| `/signup` | `Signup.jsx` | Registration screen with email OTP dispatch |
| `/verify-otp` | `VerifyOTP.jsx` | 6-digit OTP verification screen |
| `/dashboard` | `Dashboard.jsx` | Customer portal: orders, profile, wishlist & appointments |

---

## 🗄️ Database Architecture & Fallback Storage

### MySQL Schema Overview
The system contains tables for:
- `users`: ID, name, email, password hash, phone, address, role (`customer`/`admin`), created_at.
- `products`: ID, name, category, brand, price, discount, stock, rating, image, description, specifications.
- `orders`: ID, tracking_code, user_id, customer_name, shipping_address, items_json, total_amount, payment_method, payment_status, order_status, created_at.
- `services`: ID, service_name, customer_email, service_date, room_type, notes, status.
- `otps`: Email, otp_code, expires_at.

### Dual-Layer Storage Safety
1. **Primary Database:** When MySQL is online, all queries run via async connection pooling (`mysql2/promise`).
2. **Autonomous Fallback:** If the local MySQL service is stopped or unconfigured, the backend automatically switches to `server/database/store.js` using `data.json`. This guarantees uninterrupted local previewing and development.

---

## 🤝 Contributing & License

Contributions, issues, and feature requests are welcome!
Feel free to open an issue or submit a pull request to [MuzammalNazeer/Intra-Decor](https://github.com/MuzammalNazeer/Intra-Decor).

*Licensed under the [MIT License](LICENSE).*
