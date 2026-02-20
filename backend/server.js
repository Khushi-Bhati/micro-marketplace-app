require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const favoriteRoutes = require('./routes/favorites');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/favorites', favoriteRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'Micro Marketplace API is running',
        version: '1.0.0',
        endpoints: {
            auth: { register: 'POST /auth/register', login: 'POST /auth/login' },
            products: {
                list: 'GET /products',
                single: 'GET /products/:id',
                create: 'POST /products',
                update: 'PUT /products/:id',
                delete: 'DELETE /products/:id',
            },
            favorites: {
                list: 'GET /favorites',
                add: 'POST /favorites/:productId',
                remove: 'DELETE /favorites/:productId',
            },
        },
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Micro Marketplace API running on http://localhost:${PORT}`);
});

module.exports = app;
