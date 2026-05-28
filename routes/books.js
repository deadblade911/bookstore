const express = require('express');
const router = express.Router();
const { Book, Category, sequelize } = require('../models');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

// Получение списка книг с фильтрацией, поиском и пагинацией
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      genre, 
      author, 
      publisher, 
      priceMin, 
      priceMax, 
      rating, 
      search, 
      sort,
      category 
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { [Op.and]: [] };

    if (genre) {
      const genreValues = Array.isArray(genre) ? genre : [genre];
      const categoryIds = genreValues.filter(v => !isNaN(parseInt(v))).map(v => parseInt(v));
      const categoryNames = genreValues.filter(v => isNaN(parseInt(v)));
      
      const orConditions = [];
      if (categoryIds.length > 0) {
        orConditions.push({ categoryId: { [Op.in]: categoryIds } });
      }
      if (categoryNames.length > 0) {
        orConditions.push({ '$category.name$': { [Op.in]: categoryNames } });
      }
      
      if (orConditions.length > 0) {
        where[Op.and].push({ [Op.or]: orConditions });
      }
    }
    if (author) {
      where[Op.and].push({ author: { [Op.in]: Array.isArray(author) ? author : [author] } });
    }
    if (publisher) {
      where[Op.and].push({ publisher: { [Op.in]: Array.isArray(publisher) ? publisher : [publisher] } });
    }
    
    if (priceMin || priceMax) {
      const priceWhere = {};
      if (priceMin) priceWhere[Op.gte] = parseFloat(priceMin);
      if (priceMax) priceWhere[Op.lte] = parseFloat(priceMax);
      where[Op.and].push({ price: priceWhere });
    }

    if (rating) {
      where[Op.and].push({ rating: { [Op.gte]: parseFloat(rating) } });
    }

    if (search) {
      where[Op.and].push({
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { author: { [Op.iLike]: `%${search}%` } },
          { isbn: { [Op.iLike]: `%${search}%` } }
        ]
      });
    }

    if (category === 'new') {
      where[Op.and].push({
        [Op.or]: [
          { isNew: true },
          { badge: 'new' },
          { badge: 'Новинка' }
        ]
      });
    } else if (category === 'bestsellers') {
      where[Op.and].push({
        [Op.or]: [
          { badge: 'bestseller' },
          { badge: 'Хит' }
        ]
      });
    } else if (category === 'sale') {
      where[Op.and].push({
        [Op.or]: [
          { badge: 'sale' },
          { badge: 'Скидка' },
          { oldPrice: { [Op.gt]: sequelize.col('price') } }
        ]
      });
    }

    // Remove Op.and if empty
    const finalWhere = where[Op.and].length > 0 ? where : {};

    let order = [['reviewsCount', 'DESC']]; // default: popular
    if (sort === 'price-asc') order = [['price', 'ASC']];
    else if (sort === 'price-desc') order = [['price', 'DESC']];
    else if (sort === 'rating') order = [['rating', 'DESC'], ['reviewsCount', 'DESC']];
    else if (sort === 'title') order = [['title', 'ASC']];
    else if (sort === 'new') order = [['year', 'DESC']];

    const { count, rows } = await Book.findAndCountAll({
      where: finalWhere,
      include: [{ model: Category, as: 'category' }],
      order: sort ? order : [['id', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      books: rows,
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    console.error('Get books error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение списка фильтров
router.get('/meta/filters', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    
    const authors = await Book.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('author')), 'author']],
      order: [['author', 'ASC']]
    });

    const publishers = await Book.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('publisher')), 'publisher']],
      order: [['publisher', 'ASC']]
    });

    res.json({ 
        genres: categories.map(c => ({ genre: c.name, genreId: c.id })), 
        authors: authors.map(a => ({ author: a.author })), 
        publishers: publishers.map(p => ({ publisher: p.publisher }))
    });
  } catch (err) {
    console.error('Get filters error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение одной книги
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }]
    });
    if (!book) return res.status(404).json({ error: 'Книга не найдена' });
    
    // Transform to include genre for compatibility
    const bookData = book.toJSON();
    bookData.genre = book.category ? book.category.name : 'Без жанра';
    
    res.json(bookData);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
