const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  authorId: {
    type: DataTypes.STRING,
    field: 'author_id'
  },
  categoryId: {
    type: DataTypes.INTEGER,
    field: 'category_id'
  },
  publisher: {
    type: DataTypes.STRING
  },
  publisherId: {
    type: DataTypes.STRING,
    field: 'publisher_id'
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  oldPrice: {
    type: DataTypes.FLOAT,
    field: 'old_price'
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  reviewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'reviews_count'
  },
  badge: {
    type: DataTypes.STRING // 'bestseller', 'sale', 'new'
  },
  isNew: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_new'
  },
  year: {
    type: DataTypes.INTEGER
  },
  pages: {
    type: DataTypes.INTEGER
  },
  isbn: {
    type: DataTypes.STRING
  },
  coverUrl: {
    type: DataTypes.STRING,
    field: 'cover_url'
  },
  description: {
    type: DataTypes.TEXT
  }
});

module.exports = Book;
