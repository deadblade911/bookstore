require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./models');
const seed = require('./seed');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

// Routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const bookRoutes = require('./routes/books');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const viewRoutes = require('./routes/views');

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);
app.use('/', viewRoutes);

// Database Sync and Server Start
sequelize.sync({ alter: true })
  .then(async () => {
    console.log('Database synced successfully');
    await seed();
    app.listen(PORT, () => {
      console.log(`Сервер запущен: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Не удалось запустить сервер:', err.message);
    process.exit(1);
  });
