const express = require('express');
const router = express.Router();
const { Order, OrderItem, Book, Cart } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// Create Order
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { items, totalAmount, customerName, customerEmail, customerPhone, customerAddress } = req.body;
        
        const order = await Order.create({
            userId: req.user.id,
            totalAmount,
            customerName: customerName || req.user.name,
            customerEmail: customerEmail || req.user.email,
            customerPhone,
            customerAddress
        });

        for (const item of items) {
            const book = await Book.findByPk(item.id);
            if (book) {
                await OrderItem.create({
                    orderId: order.id,
                    bookId: book.id,
                    quantity: item.quantity,
                    price: book.price
                });
            }
        }

        // Clear cart after order is placed
        await Cart.destroy({ where: { userId: req.user.id } });

        res.status(201).json({ message: 'Заказ успешно оформлен', orderId: order.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при оформлении заказа' });
    }
});

// Get User Orders
router.get('/', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.user.id },
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

module.exports = router;
