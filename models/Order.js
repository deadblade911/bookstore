const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    field: 'total_amount'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  customerName: {
    type: DataTypes.STRING,
    field: 'customer_name'
  },
  customerEmail: {
    type: DataTypes.STRING,
    field: 'customer_email'
  },
  customerPhone: {
    type: DataTypes.STRING,
    field: 'customer_phone'
  },
  customerAddress: {
    type: DataTypes.TEXT,
    field: 'customer_address'
  }
});

module.exports = Order;
