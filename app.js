// Common client-side logic for MPA
const API_URL = '/api';

let state = {
    user: null,
    token: localStorage.getItem('token') || null,
    cart: []
};

// ===== DOM Elements =====
const searchInput = document.getElementById('searchInput');
const searchDropdown = document.getElementById('searchDropdown');
const cartCount = document.getElementById('cartCount');
const notificationsContainer = document.getElementById('notifications');
const userHeaderActions = document.getElementById('userHeaderActions');

// ===== API helper =====
async function apiRequest(endpoint, options = {}) {
    const config = {
        url: `${API_URL}${endpoint}`,
        method: options.method || 'GET',
        headers: { ...options.headers },
        data: options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined
    };
    if (state.token) config.headers['Authorization'] = `Bearer ${state.token}`;
    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Ошибка сервера');
    }
}

// ===== Auth =====
async function checkAuth() {
    if (!state.token) {
        renderUserActions(null);
        return;
    }
    try {
        const data = await apiRequest('/auth/me');
        state.user = data.user;
        renderUserActions(state.user);
    } catch (e) {
        state.token = null;
        localStorage.removeItem('token');
        renderUserActions(null);
    }
}

function renderUserActions(user) {
    if (!userHeaderActions) return;
    if (user) {
        userHeaderActions.innerHTML = `
            <a href="/profile" class="user-profile-btn" title="Профиль">
                <div class="user-avatar-mini">${user.name.charAt(0).toUpperCase()}</div>
                <span class="user-name-text">${user.name.split(' ')[0]}</span>
            </a>
            ${user.role === 'admin' ? `
                <a href="/admin" class="header-action-btn" title="Админка">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                </a>
            ` : ''}
            <button class="header-action-btn" onclick="logout()" title="Выйти">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
        `;
    } else {
        userHeaderActions.innerHTML = `
            <a href="/login" class="header-action-btn" title="Войти">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </a>
        `;
    }
}

async function logout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('token');
    window.location.href = '/';
}

// ===== Theme =====
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (savedTheme === 'dark') document.body.classList.add('dark-theme');
    else document.body.classList.remove('dark-theme');
    updateThemeIcons(savedTheme === 'dark');
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcons(isDark);
}

function updateThemeIcons(isDark) {
    const moonIcon = document.querySelector('#themeToggle .theme-icon-moon');
    const sunIcon = document.querySelector('#themeToggle .theme-icon-sun');
    if (moonIcon && sunIcon) {
        moonIcon.style.display = isDark ? 'none' : 'block';
        sunIcon.style.display = isDark ? 'block' : 'none';
    }
}

// ===== Cart =====
async function updateCartCount() {
    if (!state.token) return;
    try {
        const data = await apiRequest('/cart');
        state.cart = data.cart || [];
        if (cartCount) {
            cartCount.textContent = state.cart.length;
            cartCount.style.display = state.cart.length > 0 ? 'flex' : 'none';
        }
    } catch (e) {}
}

async function toggleCart(id) {
    if (!state.token) {
        window.location.href = '/login';
        return;
    }
    const bookId = parseInt(id);
    const isIn = state.cart.some(i => i.id === bookId);
    try {
        if (isIn) { 
            await apiRequest(`/cart/${bookId}`, { method: 'DELETE' }); 
            state.cart = state.cart.filter(i => i.id !== bookId); 
            showNotification('Удалено из корзины');
        } else { 
            await apiRequest('/cart', { method: 'POST', body: { bookId, quantity: 1 } }); 
            state.cart.push({ id: bookId, quantity: 1 }); 
            showNotification('Добавлено в корзину', 'success');
        }
        if (cartCount) {
            cartCount.textContent = state.cart.length;
            cartCount.style.display = state.cart.length > 0 ? 'flex' : 'none';
        }
        
        if (window.location.pathname === '/cart') window.location.reload();
        else updateBookCardsCartState();
    } catch (e) {
        showNotification(e.message, 'error');
    }
}

function updateBookCardsCartState() {
    document.querySelectorAll('[data-book-id]').forEach(btn => {
        const id = parseInt(btn.dataset.bookId);
        const isIn = state.cart.some(i => i.id === id);
        btn.textContent = isIn ? 'В корзине' : 'В корзину';
        if (isIn) btn.classList.add('btn-in-cart');
        else btn.classList.remove('btn-in-cart');
    });
}

// ===== Page Initialization =====

// --- Catalog Page (SPA-like) ---
async function initCatalog() {
    const grid = document.getElementById('booksGrid');
    if (!grid) return;

    await loadFilters(); // Load filters once
    await loadCatalogData();

    // Set up form interceptors for SPA feel
    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(filterForm);
            const params = new URLSearchParams(window.location.search);
            
            // Clean up existing filters but keep search/sort/category
            const search = params.get('search');
            const sort = params.get('sort');
            const category = params.get('category');
            
            const newParams = new URLSearchParams();
            if (search) newParams.set('search', search);
            if (sort) newParams.set('sort', sort);
            if (category) newParams.set('category', category);
            
            for (const [key, value] of formData.entries()) {
                if (value) newParams.append(key, value);
            }
            
            updateUrlAndLoad(newParams);
        });
    }

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const params = new URLSearchParams(window.location.search);
            params.set('sort', sortSelect.value);
            updateUrlAndLoad(params);
        });
    }

    // Category links interceptor
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = new URL(link.href);
            updateUrlAndLoad(url.searchParams);
        });
    });

    window.onpopstate = () => {
        syncFilterInputs();
        loadCatalogData();
    };
}

async function loadFilters() {
    const genreFilters = document.getElementById('genreFilters');
    const authorFilters = document.getElementById('authorFilters');
    if (!genreFilters) return;

    try {
        const meta = await apiRequest('/books/meta/filters');
        genreFilters.innerHTML = meta.genres.map(g => `
            <label class="filter-option">
                <input type="checkbox" name="genre" value="${g.genre}" onchange="this.form.requestSubmit()">
                <span class="checkbox-custom"></span>
                ${g.genre}
            </label>
        `).join('');
        authorFilters.innerHTML = meta.authors.map(a => `
            <label class="filter-option">
                <input type="checkbox" name="author" value="${a.author}" onchange="this.form.requestSubmit()">
                <span class="checkbox-custom"></span>
                ${a.author}
            </label>
        `).join('');
        syncFilterInputs();
    } catch (e) {
        console.error('Failed to load filters:', e);
    }
}

function syncFilterInputs() {
    const params = new URLSearchParams(window.location.search);
    const filterForm = document.getElementById('filterForm');
    if (!filterForm) return;

    // Sync inputs
    if (document.getElementById('priceMin')) document.getElementById('priceMin').value = params.get('priceMin') || '';
    if (document.getElementById('priceMax')) document.getElementById('priceMax').value = params.get('priceMax') || '';
    if (document.getElementById('sortSelect')) document.getElementById('sortSelect').value = params.get('sort') || 'popular';

    // Sync checkboxes
    filterForm.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        const values = params.getAll(cb.name);
        cb.checked = values.includes(cb.value);
    });
}

function updateUrlAndLoad(params) {
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
    loadCatalogData();
}

async function loadCatalogData() {
    const grid = document.getElementById('booksGrid');
    if (!grid) return;
    const params = new URLSearchParams(window.location.search);

    // Fetch and render books
    try {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 5rem;"><div class="loader"></div></div>';
        const data = await apiRequest(`/books?${params.toString()}`);
        const countEl = document.getElementById('booksCount');
        if (countEl) countEl.textContent = data.total;
        
        if (data.books.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 5rem; color: var(--text-muted);">Книг не найдено</div>';
        } else {
            grid.innerHTML = data.books.map(book => renderBookCard(book)).join('');
            updateBookCardsCartState();
        }
        renderPagination(data.currentPage, data.totalPages);
        syncFilterInputs(); // Ensure checkboxes match current URL
    } catch (e) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 5rem; color: var(--error);">${e.message}</div>`;
    }

    // Update active nav state
    const category = params.get('category') || 'all';
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        if (link.id === `nav-${category}`) link.classList.add('active');
        else link.classList.remove('active');
    });
}

function renderBookCard(book) {
    const isIn = state.cart.some(i => i.id === book.id);
    return `
        <div class="book-card" onclick="window.location.href='/book/${book.id}'">
            <div class="book-cover-wrapper">
                ${book.coverUrl ? `<img src="${book.coverUrl}" class="book-cover" alt="${book.title}" loading="lazy">` : 
                `<div class="book-cover" style="background:linear-gradient(135deg,#2c3e50,#8e44ad); display:flex; align-items:center; justify-content:center; color:white; font-size:2rem;">${book.title.charAt(0)}</div>`}
                ${book.badge ? `<div class="book-badge-card ${book.badge === 'sale' ? 'sale' : book.badge === 'new' ? 'new' : 'bestseller'}">${book.badge === 'sale' ? 'Скидка' : book.badge === 'new' ? 'Новинка' : 'Хит'}</div>` : ''}
            </div>
            <div class="book-info">
                <div class="book-title">${book.title}</div>
                <div class="book-author">${book.author}</div>
                <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:1rem; font-size:0.85rem; color:var(--accent);">
                    <span>★ ${book.rating || 0}</span>
                    <span style="color:var(--text-muted);">(${book.reviewsCount || 0} отзывов)</span>
                </div>
                <div class="book-price-row">
                    <div class="price-container">
                        ${book.oldPrice ? `<span class="price-old">${book.oldPrice} ₽</span>` : ''}
                        <span class="price-current ${book.oldPrice ? 'price-discount' : ''}">${book.price} ₽</span>
                    </div>
                    <button class="btn-primary ${isIn ? 'btn-in-cart' : ''}" data-book-id="${book.id}" onclick="event.stopPropagation(); toggleCart(${book.id})">
                        ${isIn ? 'В корзине' : 'В корзину'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderPagination(current, total) {
    const container = document.getElementById('paginationPages');
    if (!container) return;
    if (total <= 1) {
        document.getElementById('pagination').style.display = 'none';
        return;
    }
    document.getElementById('pagination').style.display = 'flex';
    
    let html = '';
    for (let i = 1; i <= total; i++) {
        html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="changePageAjax(${i})">${i}</button>`;
    }
    container.innerHTML = html;

    const prev = document.getElementById('prevPage');
    const next = document.getElementById('nextPage');
    prev.disabled = current === 1;
    next.disabled = current === total;
    prev.onclick = () => changePageAjax(current - 1);
    next.onclick = () => changePageAjax(current + 1);
}

window.changePageAjax = (page) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page);
    updateUrlAndLoad(params);
};

window.switchTab = (btn, tabId) => {
    const container = btn.closest('.tabs');
    container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    container.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    
    btn.classList.add('active');
    const content = document.getElementById(`tab-${tabId}`);
    if (content) content.style.display = 'block';
};

// --- Book Detail Page ---
async function initBookDetail() {
    const details = document.getElementById('bookDetails');
    if (!details) return;

    const bookId = window.location.pathname.split('/').pop();
    if (!bookId || isNaN(bookId)) return;

    try {
        const book = await apiRequest(`/books/${bookId}`);
        const reviews = await apiRequest(`/reviews/${bookId}`); 
        
        document.title = `${book.title} — КнигоМир`;
        const isIn = state.cart.some(i => i.id === book.id);

        details.innerHTML = `
            <div class="book-detail-cover">
                ${book.coverUrl ? `<img src="${book.coverUrl}" alt="${book.title}" style="width:100%; border-radius: var(--radius-md); box-shadow: var(--shadow-lg);">` : 
                `<div style="width:100%; height:500px; background:linear-gradient(135deg,#2c3e50,#8e44ad); display:flex; align-items:center; justify-content:center; color:white; font-size:5rem; border-radius: var(--radius-md);">${book.title.charAt(0)}</div>`}
            </div>
            <div class="book-detail-info">
                <h1>${book.title}</h1>
                <p class="book-author" style="font-size:1.2rem; margin-top:0.5rem;">${book.author}</p>
                <div class="book-rating-badge" style="display:flex; align-items:center; gap:1rem; margin:1.5rem 0;">
                    <div style="background:var(--accent); color:white; padding:0.4rem 0.8rem; border-radius:var(--radius-sm); font-weight:700;">★ ${book.rating || 0}</div>
                    <span style="color:var(--text-muted);">${book.reviewsCount || 0} отзывов</span>
                </div>
                <div class="price-card" style="background:var(--bg-main); padding:1.5rem; border-radius:var(--radius-md); border:1px solid var(--border); margin-bottom:2rem;">
                    <div style="margin-bottom:1rem;">
                        ${book.oldPrice ? `<span style="text-decoration:line-through; color:var(--text-muted); margin-right:1rem;">${book.oldPrice} ₽</span>` : ''}
                        <span style="font-size:2rem; font-weight:800; color:var(--primary);">${book.price} ₽</span>
                    </div>
                    <button class="btn-primary" style="width:100%;" data-book-id="${book.id}" onclick="toggleCart(${book.id})">
                        ${isIn ? 'В корзине' : 'В корзину'}
                    </button>
                </div>
                <div class="book-meta-grid" style="display:grid; grid-template-columns: repeat(2, 1fr); gap:1.5rem;">
                    <div><span style="color:var(--text-muted);">Жанр:</span><br><strong>${book.genre}</strong></div>
                    <div><span style="color:var(--text-muted);">Год:</span><br><strong>${book.year}</strong></div>
                    <div><span style="color:var(--text-muted);">ISBN:</span><br><strong>${book.isbn}</strong></div>
                    <div><span style="color:var(--text-muted);">Страниц:</span><br><strong>${book.pages}</strong></div>
                </div>
                <div class="tabs" style="margin-top:3rem;">
                    <div class="tab-header" style="display:flex; gap:2rem; border-bottom:1px solid var(--border); margin-bottom:1.5rem;">
                        <button class="tab-btn active" onclick="switchTab(this, 'desc')">Описание</button>
                        <button class="tab-btn" onclick="switchTab(this, 'reviews')">Отзывы</button>
                    </div>
                    <div id="tab-desc" class="tab-content active"><p>${book.description}</p></div>
                    <div id="tab-reviews" class="tab-content" style="display:none;">
                        <div id="reviewsList" class="reviews-compact-container"></div>
                        
                        ${state.user ? `
                            <div style="margin-top: 3rem;">
                                <form id="reviewForm" class="form-compact">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Оцените книгу</span>
                                        <div class="star-rating-mini" id="starRating">
                                            <span data-value="1">★</span>
                                            <span data-value="2">★</span>
                                            <span data-value="3">★</span>
                                            <span data-value="4">★</span>
                                            <span data-value="5">★</span>
                                        </div>
                                        <input type="hidden" name="rating" id="ratingInput" value="5">
                                    </div>
                                    <textarea name="text" placeholder="Ваш отзыв..." required></textarea>
                                    <button type="submit" class="btn-primary" style="width: 100%; height: 40px; font-size: 0.9rem; font-weight: 600;">Отправить</button>
                                </form>
                            </div>
                        ` : `
                            <div style="margin-top: 2rem; text-align: center; padding: 1.5rem; border: 1px dashed var(--border); border-radius: var(--radius-md);">
                                <a href="/login" style="font-size: 0.9rem; color: var(--primary); font-weight: 600;">Войдите</a> <span style="font-size: 0.9rem; color: var(--text-muted);">чтобы оставить отзыв</span>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;

        const list = document.getElementById('reviewsList');
        if (list) {
            list.innerHTML = reviews.reviews.length === 0 ? 
                '<div style="font-size: 0.9rem; color: var(--text-muted); text-align: center; padding: 2rem;">Отзывов пока нет</div>' : 
                reviews.reviews.map(r => `
                    <div class="review-item-compact">
                        <div class="review-meta-compact">
                            <span class="review-author-compact">${r.authorName || 'Аноним'}</span>
                            <span class="review-rating-compact">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span>
                            <span class="review-date-compact" style="margin-left: auto;">${new Date(r.createdAt || Date.now()).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                        </div>
                        <div class="review-text-compact">${r.text}</div>
                    </div>
                `).join('');
        }

        // Add star rating interaction
        const starRating = document.getElementById('starRating');
        const ratingInput = document.getElementById('ratingInput');
        if (starRating && ratingInput) {
            const stars = Array.from(starRating.querySelectorAll('span'));
            const updateStars = (val) => {
                stars.forEach(s => s.classList.toggle('active', s.dataset.value <= val));
            };
            stars.forEach(star => {
                star.addEventListener('click', () => {
                    const val = star.dataset.value;
                    ratingInput.value = val;
                    updateStars(val);
                });
            });
            updateStars(5);
        }

        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) {
            reviewForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(reviewForm);
                try {
                    await apiRequest('/reviews', { method: 'POST', body: { bookId: parseInt(bookId), rating: parseInt(formData.get('rating')), text: formData.get('text') } });
                    showNotification('Отзыв добавлен!', 'success');
                    window.location.reload();
                } catch (err) { showNotification(err.message, 'error'); }
            });
        }
    } catch (e) {
        details.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 5rem; color: var(--error);">${e.message}</div>`;
    }
}

// --- Cart Page ---
async function initCart() {
    const list = document.getElementById('cartList');
    const total = document.getElementById('cartTotal');
    if (!list) return;

    if (!state.token) { window.location.href = '/login'; return; }

    try {
        const data = await apiRequest('/cart');
        const items = (data.cart || []).filter(item => item && item.book);
        let totalPrice = 0;

        if (items.length === 0) {
            list.innerHTML = `
                <div style="text-align:center; padding: 5rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border);">
                    <div style="font-size: 4rem; margin-bottom: 1.5rem;">🛒</div>
                    <h2 style="margin-bottom: 1rem;">Ваша корзина пуста</h2>
                    <p style="color: var(--text-muted); margin-bottom: 2rem;">Самое время наполнить её отличными книгами!</p>
                    <a href="/catalog" class="btn-primary" style="padding: 1rem 2.5rem;">Перейти в каталог</a>
                </div>
            `;
            if (total) total.style.display = 'none';
        } else {
            list.innerHTML = items.map(item => {
                const book = item.book;
                const price = book.price || 0;
                totalPrice += price * item.quantity;
                return `
                    <div class="cart-item" style="display:flex; gap:2rem; padding:1.5rem; background:var(--bg-card); border-radius:var(--radius-md); margin-bottom:1.5rem; border:1px solid var(--border); transition: var(--transition); box-shadow: var(--shadow-sm);">
                        <img src="${book.coverUrl || ''}" style="width:110px; height:160px; object-fit:cover; border-radius:var(--radius-sm); box-shadow: var(--shadow-sm);">
                        <div style="flex:1; display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <h3 style="margin-bottom: 0.25rem;">${book.title}</h3>
                                <p style="color:var(--text-muted); font-size: 0.95rem;">${book.author}</p>
                            </div>
                            <div style="margin-top:1rem; display:flex; align-items:center; justify-content: space-between;">
                                <div style="display:flex; align-items: center; gap: 1rem;">
                                    <div style="display:flex; border:1px solid var(--border); border-radius:var(--radius-sm); background: var(--bg-main); overflow: hidden;">
                                        <button onclick="updateQuantity(${book.id}, ${item.quantity - 1})" style="padding:0.4rem 0.8rem; border:none; background:none; cursor:pointer; font-weight: 700; transition: background 0.2s;">-</button>
                                        <span style="padding:0.4rem 1rem; border-left: 1px solid var(--border); border-right: 1px solid var(--border); min-width: 45px; text-align: center; font-weight: 600;">${item.quantity}</span>
                                        <button onclick="updateQuantity(${book.id}, ${item.quantity + 1})" style="padding:0.4rem 0.8rem; border:none; background:none; cursor:pointer; font-weight: 700; transition: background 0.2s;">+</button>
                                    </div>
                                    <strong style="font-size: 1.2rem; color: var(--primary);">${price * item.quantity} ₽</strong>
                                </div>
                                <button onclick="toggleCart(${book.id})" style="color:var(--error); border:none; background:none; cursor:pointer; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 0.4rem;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    Удалить
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            if (total) {
                total.style.display = 'block';
                total.innerHTML = `
                    <div style="background:var(--bg-card); padding:2rem; border-radius:var(--radius-lg); border:1px solid var(--border); position: sticky; top: calc(var(--header-height) + 2rem); box-shadow: var(--shadow-md);">
                        <h3 style="margin-bottom: 1.5rem; font-size: 1.3rem;">Ваш заказ</h3>
                        <div style="display:flex; justify-content:space-between; margin-bottom:1rem; color: var(--text-muted);">
                            <span>Книг:</span>
                            <span>${items.length}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:1.5rem; padding-top: 1rem; border-top: 1px solid var(--border); font-size:1.4rem; font-weight: 800;">
                            <span>Итого:</span>
                            <span style="color:var(--primary);">${totalPrice} ₽</span>
                        </div>
                        <button onclick="placeOrder(${totalPrice})" class="btn-primary" style="width:100%; padding:1rem; height: 55px; font-size: 1.1rem; font-weight: 700;">Оформить заказ</button>
                        <p style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted); text-align: center;">Бесплатная доставка при заказе от 3000 ₽</p>
                    </div>
                `;
            }
        }
    } catch (e) { 
        console.error('Init cart error:', e);
        list.innerHTML = `<div style="text-align:center; padding:5rem; color:var(--error); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border);">${e.message}</div>`; 
    }
}

window.updateQuantity = async (bookId, quantity) => {
    try {
        await apiRequest(`/cart/${bookId}`, { method: 'PUT', body: { quantity } });
        await updateCartCount();
        initCart();
    } catch (e) { showNotification(e.message, 'error'); }
};

// --- Profile Page ---
async function initProfile() {
    const list = document.getElementById('ordersList');
    if (!list) return;
    if (!state.token) { window.location.href = '/login'; return; }
    try {
        const data = await apiRequest('/auth/me');
        if (document.getElementById('profileName')) document.getElementById('profileName').textContent = data.user.name;
        if (document.getElementById('profileEmail')) document.getElementById('profileEmail').textContent = data.user.email;
        const orders = await apiRequest('/orders');
        if (orders.orders.length === 0) {
            list.innerHTML = '<p style="text-align:center; padding:3rem; color:var(--text-muted);">Заказов пока нет</p>';
        } else {
            list.innerHTML = orders.orders.map(order => `
                <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-md); padding:1.5rem; margin-bottom:1.5rem;">
                    <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border); padding-bottom:0.5rem; margin-bottom:1rem;">
                        <strong>Заказ #${order.id.split('-')[0]}</strong>
                        <span style="color:var(--text-muted);">${new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style="margin-bottom:1rem;">${order.items.length} книг на сумму <strong>${order.totalAmount} ₽</strong></div>
                    <div style="color:var(--primary); font-weight:600;">Статус: ${order.status}</div>
                </div>
            `).join('');
        }
    } catch (e) { list.innerHTML = `<p style="color:var(--error);">${e.message}</p>`; }
}

// --- Home Page ---
async function initHome() {
    const grid = document.getElementById('featuredBooksGrid');
    if (!grid) return;
    try {
        const data = await apiRequest('/books?sort=rating&limit=4');
        grid.innerHTML = data.books.map(book => renderBookCard(book)).join('');
        updateBookCardsCartState();
    } catch (e) { grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 3rem; color: var(--error);">${e.message}</div>`; }
}

// --- Auth Page ---
function initAuth() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            try {
                const data = await apiRequest('/auth/login', { method: 'POST', body: { email: formData.get('email'), password: formData.get('password') } });
                localStorage.setItem('token', data.token);
                window.location.href = '/';
            } catch (err) { showNotification(err.message, 'error'); }
        });
    }
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            try {
                const data = await apiRequest('/auth/register', { method: 'POST', body: { name: formData.get('name'), email: formData.get('email'), password: formData.get('password') } });
                localStorage.setItem('token', data.token);
                window.location.href = '/';
            } catch (err) { showNotification(err.message, 'error'); }
        });
    }
}

// --- Admin Page ---
async function initAdmin() {
    if (!state.token || (state.user && state.user.role !== 'admin')) { window.location.href = '/'; return; }
    loadAdminTab('books');
}

window.loadAdminTab = async (tab) => {
    const content = document.getElementById('adminContent');
    if (!content) return;
    content.innerHTML = '<div style="text-align:center; padding: 5rem;"><div class="loader"></div></div>';
    try {
        if (tab === 'books') {
            const data = await apiRequest('/books?limit=100');
            content.innerHTML = `<table class="admin-table"><thead><tr><th>ID</th><th>Название</th><th>Автор</th><th>Цена</th><th>Действия</th></tr></thead>
            <tbody>${data.books.map(book => `<tr><td>${book.id}</td><td>${book.title}</td><td>${book.author}</td><td>${book.price} ₽</td><td><button onclick="editBook(${book.id})">✏️</button><button onclick="deleteBook(${book.id})">🗑️</button></td></tr>`).join('')}</tbody></table>`;
        } else if (tab === 'orders') {
            const data = await apiRequest('/admin/orders');
            content.innerHTML = `<table class="admin-table"><thead><tr><th>ID</th><th>Дата</th><th>Сумма</th><th>Статус</th></tr></thead>
            <tbody>${data.orders.map(order => `<tr><td>#${order.id.split('-')[0]}</td><td>${new Date(order.createdAt).toLocaleDateString()}</td><td>${order.totalAmount} ₽</td><td>${order.status}</td></tr>`).join('')}</tbody></table>`;
        } else if (tab === 'reviews') {
            const data = await apiRequest('/admin/reviews');
            content.innerHTML = `<table class="admin-table"><thead><tr><th>ID</th><th>Рейтинг</th><th>Текст</th><th>Действия</th></tr></thead>
            <tbody>${data.reviews.map(review => `<tr><td>${review.id}</td><td>${review.rating} ★</td><td style="max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${review.text}</td><td><button onclick="deleteReview(${review.id})">🗑️</button></td></tr>`).join('')}</tbody></table>`;
        }
    } catch (e) { content.innerHTML = `<p style="color:var(--error);">${e.message}</p>`; }
};

window.deleteReview = async (id) => { if(confirm('Удалить отзыв?')) { try { await apiRequest(`/admin/reviews/${id}`, { method: 'DELETE' }); showNotification('Отзыв удален', 'success'); loadAdminTab('reviews'); } catch(e) { showNotification(e.message, 'error'); } } };
window.deleteBook = async (id) => { if(confirm('Удалить?')) { await apiRequest(`/books/${id}`, { method: 'DELETE' }); loadAdminTab('books'); } };

// ===== Search & Utils =====
async function handleSearch() {
    if (!searchInput) return;
    const query = searchInput.value.trim().toLowerCase();
    if (query.length >= 2) {
        searchDropdown.classList.add('active');
        searchDropdown.innerHTML = '<div style="padding:1rem; text-align:center;"><div class="loader" style="width:20px; height:20px; margin:0 auto;"></div></div>';
        try {
            const data = await apiRequest(`/books?search=${query}&limit=8`);
            searchDropdown.innerHTML = `<div class="search-results-modern">${data.books.map(book => `
                <a href="/book/${book.id}" class="search-result-item">
                    <img src="${book.coverUrl || 'https://via.placeholder.com/50x75'}" style="width: 40px; height: 60px; object-fit: cover; border-radius: 4px;">
                    <div>
                        <div style="font-weight: 700; font-size: 0.9rem; line-height: 1.2;">${book.title}</div>
                        <small style="color: var(--text-muted);">${book.author}</small>
                    </div>
                    <span style="font-weight: 700; color: var(--primary); font-size: 0.9rem;">${book.price} ₽</span>
                </a>`).join('')}</div>`;
        } catch (e) { searchDropdown.innerHTML = '<div style="padding:1rem;">Ошибка</div>'; }
    } else searchDropdown.classList.remove('active');
}

function showNotification(m, t = '') {
    const n = document.createElement('div'); n.className = `notification ${t}`; n.textContent = m;
    if (notificationsContainer) { notificationsContainer.appendChild(n); setTimeout(() => n.remove(), 3000); }
}

function debounce(f, w) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), w); }; }

document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    if (document.getElementById('themeToggle')) document.getElementById('themeToggle').onclick = toggleTheme;
    
    await checkAuth();
    await updateCartCount();
    const path = window.location.pathname;
    if (path === '/' || path === '/index.html') initHome();
    else if (path === '/catalog') initCatalog();
    else if (path.startsWith('/book/')) initBookDetail();
    else if (path === '/cart') initCart();
    else if (path === '/login' || path === '/register') initAuth();
    else if (path === '/profile') initProfile();
    else if (path === '/admin') initAdmin();

    if (searchInput) {
        searchInput.oninput = debounce(handleSearch, 300);
        searchInput.onfocus = () => { if (searchInput.value.length >= 2) searchDropdown.classList.add('active'); };
    }
    document.onclick = (e) => { if (!e.target.closest('.search-container')) searchDropdown?.classList.remove('active'); };
});
