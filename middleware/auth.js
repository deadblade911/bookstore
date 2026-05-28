const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function authMiddleware(req, res, next) {
  let token = req.headers.authorization?.replace('Bearer ', '');
  if (!token && req.cookies) {
    token = req.cookies.token;
  }

  if (!token) {
    if (req.headers.accept?.includes('html')) {
        return res.redirect('/login');
    }
    return res.status(401).json({ error: 'Не авторизован' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'email', 'name', 'role']
    });

    if (!user) {
      if (req.headers.accept?.includes('html')) {
        return res.redirect('/login');
      }
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    if (req.headers.accept?.includes('html')) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
    res.status(401).json({ error: 'Неверный или истекший токен' });
  }
}

async function checkUser(req, res, next) {
    let token = req.headers.authorization?.replace('Bearer ', '');
    if (!token && req.cookies) {
      token = req.cookies.token;
    }
  
    if (!token) {
      req.user = null;
      return next();
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'email', 'name', 'role']
      });
      req.user = user;
    } catch (err) {
      req.user = null;
    }
    next();
}

function adminMiddleware(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    if (req.headers.accept?.includes('html')) {
        return res.redirect('/');
    }
    res.status(403).json({ error: 'Доступ запрещен: требуется роль администратора' });
  }
}

module.exports = { authMiddleware, adminMiddleware, checkUser };
