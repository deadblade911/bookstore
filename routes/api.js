const express = require('express');
const router = express.Router();
const { Cart, Book, Review, User } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// Корзина
router.get('/cart', authMiddleware, async (req, res) => {
  try {
    const items = await Cart.findAll({ 
      where: { userId: req.user.id },
      include: [{ model: Book, as: 'book' }]
    });
    console.log(`Get cart for user ${req.user.id}: found ${items.length} items`);
    res.json({ cart: items.map(i => ({ 
      id: i.bookId, 
      quantity: i.quantity,
      book: i.book 
    })) });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/cart', authMiddleware, async (req, res) => {
  try {
    const { bookId, quantity } = req.body;
    console.log(`Add to cart: user ${req.user.id}, book ${bookId}, quantity ${quantity}`);
    
    if (!bookId) {
      return res.status(400).json({ error: 'ID книги не указан' });
    }

    let item = await Cart.findOne({ where: { userId: req.user.id, bookId } });
    if (item) {
      item.quantity += (quantity || 1);
      await item.save();
    } else {
      item = await Cart.create({ userId: req.user.id, bookId, quantity: quantity || 1 });
    }
    res.json({ message: 'Добавлено в корзину', item });
  } catch (err) {
    console.error('Post cart error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.put('/cart/:bookId', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    const { bookId } = req.params;
    console.log(`Update cart: user ${req.user.id}, book ${bookId}, quantity ${quantity}`);

    if (quantity <= 0) {
      await Cart.destroy({ where: { userId: req.user.id, bookId } });
      return res.json({ message: 'Удалено из корзины' });
    }
    await Cart.update({ quantity }, { where: { userId: req.user.id, bookId } });
    res.json({ message: 'Количество обновлено' });
  } catch (err) {
    console.error('Put cart error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/cart/:bookId', authMiddleware, async (req, res) => {
  try {
    const { bookId } = req.params;
    console.log(`Delete from cart: user ${req.user.id}, book ${bookId}`);
    await Cart.destroy({ where: { userId: req.user.id, bookId } });
    res.json({ message: 'Удалено из корзины' });
  } catch (err) {
    console.error('Delete cart error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Отзывы
router.get('/reviews/:bookId', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { bookId: req.params.bookId },
      order: [['createdAt', 'DESC']]
    });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/reviews', authMiddleware, async (req, res) => {
  try {
    const { bookId, rating, text } = req.body;
    const review = await Review.create({
      userId: req.user.id,
      bookId,
      rating,
      text,
      authorName: req.user.name
    });
    
    // Update book rating (simplified)
    const book = await Book.findByPk(bookId);
    if (book) {
      const reviews = await Review.findAll({ where: { bookId } });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      book.rating = parseFloat(avgRating.toFixed(1));
      book.reviewsCount = reviews.length;
      await book.save();
    }
    
    res.json({ message: 'Отзыв добавлен', review });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
