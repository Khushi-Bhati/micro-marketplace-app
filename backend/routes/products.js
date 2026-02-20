const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/database');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();


router.get('/', optionalAuth, (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const category = req.query.category || '';
        const sortBy = req.query.sortBy || 'created_at';
        const order = req.query.order === 'asc' ? 'ASC' : 'DESC';

        const allowedSortFields = ['title', 'price', 'created_at'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';

        let whereClause = '1=1';
        const params = [];

        if (search) {
            whereClause += ' AND (p.title LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (category) {
            whereClause += ' AND p.category = ?';
            params.push(category);
        }


        const countResult = db
            .prepare(`SELECT COUNT(*) as total FROM products p WHERE ${whereClause}`)
            .get(...params);

        const total = countResult.total;
        const totalPages = Math.ceil(total / limit);

        let productsQuery;
        let queryParams;

        if (req.user) {
            productsQuery = `
        SELECT p.*, u.username as seller_name,
          CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorited
        FROM products p
        LEFT JOIN users u ON p.seller_id = u.id
        LEFT JOIN favorites f ON f.product_id = p.id AND f.user_id = ?
        WHERE ${whereClause}
        ORDER BY p.${sortField} ${order}
        LIMIT ? OFFSET ?
      `;
            queryParams = [req.user.id, ...params, limit, offset];
        } else {
            productsQuery = `
        SELECT p.*, u.username as seller_name, 0 as is_favorited
        FROM products p
        LEFT JOIN users u ON p.seller_id = u.id
        WHERE ${whereClause}
        ORDER BY p.${sortField} ${order}
        LIMIT ? OFFSET ?
      `;
            queryParams = [...params, limit, offset];
        }

        const products = db.prepare(productsQuery).all(...queryParams);

        res.json({
            products: products.map((p) => ({ ...p, is_favorited: Boolean(p.is_favorited) })),
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:id', optionalAuth, (req, res) => {
    try {
        const { id } = req.params;

        let productQuery;
        let queryParams;

        if (req.user) {
            productQuery = `
        SELECT p.*, u.username as seller_name,
          CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorited
        FROM products p
        LEFT JOIN users u ON p.seller_id = u.id
        LEFT JOIN favorites f ON f.product_id = p.id AND f.user_id = ?
        WHERE p.id = ?
      `;
            queryParams = [req.user.id, id];
        } else {
            productQuery = `
        SELECT p.*, u.username as seller_name, 0 as is_favorited
        FROM products p
        LEFT JOIN users u ON p.seller_id = u.id
        WHERE p.id = ?
      `;
            queryParams = [id];
        }

        const product = db.prepare(productQuery).get(...queryParams);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ ...product, is_favorited: Boolean(product.is_favorited) });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post(
    '/',
    authMiddleware,
    [
        body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title must be 2-200 characters'),
        body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
        body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
        body('image').optional().isURL().withMessage('Image must be a valid URL'),
        body('category').optional().trim(),
    ],
    (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { title, description, price, image, category } = req.body;

            const result = db
                .prepare(
                    'INSERT INTO products (title, description, price, image, category, seller_id) VALUES (?, ?, ?, ?, ?, ?)'
                )
                .run(title, description, price, image || '', category || 'general', req.user.id);

            const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);

            res.status(201).json(product);
        } catch (error) {
            console.error('Create product error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);


router.put(
    '/:id',
    authMiddleware,
    [
        body('title').optional().trim().isLength({ min: 2, max: 200 }),
        body('description').optional().trim().isLength({ min: 10, max: 2000 }),
        body('price').optional().isFloat({ min: 0.01 }),
        body('image').optional().isURL(),
        body('category').optional().trim(),
    ],
    (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { id } = req.params;
            const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            if (product.seller_id !== req.user.id) {
                return res.status(403).json({ error: 'Not authorized to update this product' });
            }

            const { title, description, price, image, category } = req.body;

            db.prepare(
                `UPDATE products SET
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          image = COALESCE(?, image),
          category = COALESCE(?, category),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
            ).run(
                title || null,
                description || null,
                price || null,
                image || null,
                category || null,
                id
            );

            const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
            res.json(updated);
        } catch (error) {
            console.error('Update product error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);


router.delete('/:id', authMiddleware, (req, res) => {
    try {
        const { id } = req.params;
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.seller_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this product' });
        }

        db.prepare('DELETE FROM products WHERE id = ?').run(id);

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
