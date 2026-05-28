const express = require('express');
const router = express.Router();
const path = require('path');

// Helper to send HTML files
const sendHtml = (res, filename) => {
    res.sendFile(path.join(__dirname, '..', filename));
};

// Home
router.get('/', (req, res) => {
    sendHtml(res, 'index.html');
});

// Catalog
router.get('/catalog', (req, res) => {
    sendHtml(res, 'catalog.html');
});

// Book Detail
router.get('/book/:id', (req, res) => {
    sendHtml(res, 'book.html');
});

// Cart
router.get('/cart', (req, res) => {
    sendHtml(res, 'cart.html');
});

// Profile
router.get('/profile', (req, res) => {
    sendHtml(res, 'profile.html');
});

// Admin
router.get('/admin', (req, res) => {
    sendHtml(res, 'admin.html');
});

// Auth
router.get('/login', (req, res) => {
    sendHtml(res, 'auth.html');
});

router.get('/register', (req, res) => {
    sendHtml(res, 'auth.html');
});

module.exports = router;
