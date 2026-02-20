# 🛍️ MicroMart - Micro Marketplace App

A full-stack marketplace application with **Backend API**, **React Web App**, and **React Native Mobile App**.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![Expo](https://img.shields.io/badge/Expo-SDK_54-purple)
![SQLite](https://img.shields.io/badge/SQLite-Database-lightgrey)

---

## 📁 Project Structure

```
micro-marketplace-app/
├── backend/          # Node.js + Express REST API
│   ├── config/       # Database configuration
│   ├── middleware/    # JWT auth middleware
│   ├── routes/       # API route handlers
│   ├── server.js     # Entry point
│   ├── seed.js       # Database seeding script
│   └── .env          # Environment variables
├── web/              # React (Vite) Web Application
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── context/      # Auth context provider
│       ├── pages/        # Page components
│       └── services/     # API service layer
├── mobile/           # React Native (Expo) Mobile App
│   └── src/
│       ├── context/      # Auth context provider
│       ├── screens/      # Screen components
│       └── services/     # API service layer
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher
- **Expo Go** app (for mobile testing on physical device)

### 1. Backend Setup

```bash
cd backend
npm install
npm run seed    # Seed database with 10 products & 2 users
npm run dev     # Start dev server on http://localhost:5000
```

### 2. Web App Setup

```bash
cd web
npm install
npm run dev     # Start dev server on http://localhost:5173
```

### 3. Mobile App Setup

```bash
cd mobile
npm install
npx expo start  # Start Expo dev server
```

> **Note for mobile:** Update `API_BASE` in `mobile/src/services/api.js` with your machine's IP address (e.g., `http://192.168.1.100:5000`) to connect from a physical device. Use `http://10.0.2.2:5000` for Android emulator.

---

## 🔑 Test Credentials

| User | Email | Password |
|------|-------|----------|
| John Doe | `john@example.com` | `password123` |
| Jane Smith | `jane@example.com` | `password123` |

---

## 📡 API Documentation

**Base URL:** `http://localhost:5000`

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register a new user | ❌ |
| POST | `/auth/login` | Login & get JWT token | ❌ |

#### POST `/auth/register`
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 3, "username": "newuser", "email": "user@example.com" }
}
```

#### POST `/auth/login`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "username": "john_doe", "email": "john@example.com" }
}
```

### Products

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/products` | List products (search + pagination) | Optional |
| GET | `/products/:id` | Get single product | Optional |
| POST | `/products` | Create product | ✅ Required |
| PUT | `/products/:id` | Update product | ✅ Required |
| DELETE | `/products/:id` | Delete product | ✅ Required |

#### GET `/products` Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 50) |
| `search` | string | - | Search in title & description |
| `category` | string | - | Filter by category |
| `sortBy` | string | `created_at` | Sort field: `title`, `price`, `created_at` |
| `order` | string | `DESC` | Sort order: `asc` or `desc` |

**Response (200):**
```json
{
  "products": [
    {
      "id": 1,
      "title": "Wireless Headphones",
      "description": "Premium headphones...",
      "price": 299.99,
      "image": "https://...",
      "category": "electronics",
      "seller_id": 1,
      "seller_name": "john_doe",
      "is_favorited": false,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### Favorites

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/favorites` | Get user's favorites | ✅ Required |
| POST | `/favorites/:productId` | Add to favorites | ✅ Required |
| DELETE | `/favorites/:productId` | Remove from favorites | ✅ Required |

**Auth Header:** `Authorization: Bearer <token>`

---

## ✨ Features

### Backend
- ✅ RESTful API with Express.js
- ✅ SQLite database (zero config)
- ✅ JWT authentication with bcrypt password hashing
- ✅ Input validation with express-validator
- ✅ Search with LIKE queries + pagination
- ✅ Category filtering & sorting
- ✅ Proper HTTP status codes (200, 201, 400, 401, 403, 404, 409, 500)
- ✅ CORS enabled
- ✅ Seed script with 10 products + 2 users

### Web App
- ✅ Login & Register with form validation
- ✅ Product listing with grid layout
- ✅ Search with debounced input (400ms)
- ✅ Category chip filters
- ✅ Pagination with page numbers
- ✅ Product detail page with full info
- ✅ Favorite/Unfavorite with heart animation
- ✅ **Creative UI:** Animated particle background with connected nodes
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark theme with glassmorphism
- ✅ Staggered card entry animations
- ✅ Gradient text effects

### Mobile App
- ✅ Login screen with secure token storage
- ✅ 2-column product grid
- ✅ Search products
- ✅ Pull-to-refresh
- ✅ Infinite scroll pagination
- ✅ Product detail with full-width image
- ✅ Favorite/Unfavorite with heart animation
- ✅ Bottom tab navigation
- ✅ Dark theme matching web design
- ✅ Animated card entry (spring animation)

---

## 🎨 Seed Data

10 products across 6 categories seeded by `npm run seed`:

| # | Product | Price | Category |
|---|---------|-------|----------|
| 1 | Wireless Noise-Cancelling Headphones | $299.99 | electronics |
| 2 | Vintage Leather Messenger Bag | $149.99 | fashion |
| 3 | Smart Home Security Camera | $79.99 | electronics |
| 4 | Organic Matcha Tea Set | $44.99 | food |
| 5 | Minimalist Mechanical Keyboard | $129.99 | electronics |
| 6 | Handmade Ceramic Plant Pot Set | $34.99 | home |
| 7 | Professional Yoga Mat | $59.99 | fitness |
| 8 | Artisan Coffee Bean Sampler | $39.99 | food |
| 9 | Portable Bluetooth Speaker | $69.99 | electronics |
| 10 | Illustrated World Atlas | $54.99 | books |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express.js, SQLite (better-sqlite3) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Validation | express-validator |
| Web | React 18, Vite, React Router, Axios |
| Mobile | React Native, Expo SDK 54, React Navigation |
| Styling | Vanilla CSS (web), StyleSheet (mobile) |

---

## 📝 Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (not owner) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Internal Server Error |

---

## 📄 License

MIT License
