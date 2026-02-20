const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();


router.get('/', authMiddleware, (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const offset = (page - 1) * limit;

        const countResult = db
            .prepare('SELECT COUNT(*) as total FROM favorites WHERE user_id = ?')
            .get(req.user.id);

        const total = countResult.total;
        const totalPages = Math.ceil(total / limit);

        const favorites = db
            .prepare(
                `SELECT p.*, u.username as seller_name, 1 as is_favorited, f.created_at as favorited_at
         FROM favorites f
         JOIN products p ON f.product_id = p.id
         LEFT JOIN users u ON p.seller_id = u.id
         WHERE f.user_id = ?
         ORDER BY f.created_at DESC
         LIMIT ? OFFSET ?`
            )
            .all(req.user.id, limit, offset);

        res.json({
            favorites: favorites.map((f) => ({ ...f, is_favorited: true })),
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/:productId', authMiddleware, (req, res) => {
    try {
        const { productId } = req.params;


        const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const existing = db
            .prepare('SELECT id FROM favorites WHERE user_id = ? AND product_id = ?')
            .get(req.user.id, productId);

        if (existing) {
            return res.status(409).json({ error: 'Product already in favorites' });
        }

        db.prepare('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)').run(req.user.id, productId);

        res.status(201).json({ message: 'Added to favorites' });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.delete('/:productId', authMiddleware, (req, res) => {
    try {
        const { productId } = req.params;

        const result = db
            .prepare('DELETE FROM favorites WHERE user_id = ? AND product_id = ?')
            .run(req.user.id, productId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        res.json({ message: 'Removed from favorites' });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
