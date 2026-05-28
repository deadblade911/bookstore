const express = require('express');
const router = express.Router();
const { Order, Review, Book, User, OrderItem } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const booksCount = await Book.count();
        const ordersCount = await Order.count();
        const usersCount = await User.count();
        res.json({ booksCount, ordersCount, usersCount });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Orders
router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{ model: Book, as: 'book' }]
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ orders });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Reviews
router.get('/reviews', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const reviews = await Review.findAll({ order: [['createdAt', 'DESC']] });
        res.json({ reviews });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

router.delete('/reviews/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await Review.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Отзыв удален' });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

module.exports = router;
