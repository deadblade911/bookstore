const { Book, Category, User } = require('./models');

const booksData = [
    {
        title: "Война и мир", author: "Лев Толстой", authorId: "tolstoy",
        genre: "Художественная литература", publisher: "ЭКСМО", publisherId: "eksimo",
        price: 890, oldPrice: 1200, rating: 5, reviewsCount: 15, badge: "bestseller", isNew: false,
        year: 2023, pages: 1225, isbn: "978-5-04-098651-2", coverUrl: "https://covers.openlibrary.org/b/isbn/9785040986512-L.jpg",
        description: "Роман-эпопея Льва Толстого, одно из величайших произведений русской литературы."
    },
    {
        title: "Оно", author: "Стивен Кинг", authorId: "king",
        genre: "Ужасы", publisher: "АСТ", publisherId: "ast",
        price: 780, oldPrice: null, rating: 4.8, reviewsCount: 42, badge: null, isNew: true,
        year: 2024, pages: 1120, isbn: "978-5-17-123456-7", coverUrl: "https://covers.openlibrary.org/b/isbn/9785171234567-L.jpg",
        description: "Один из самых страшных и эпических романов Стивена Кинга."
    },
    {
        title: "Гарри Поттер и философский камень", author: "Дж.К. Роулинг", authorId: "rowling",
        genre: "Фэнтези", publisher: "Росмэн", publisherId: "eksimo",
        price: 650, oldPrice: null, rating: 4.9, reviewsCount: 120, badge: "bestseller", isNew: false,
        year: 2023, pages: 432, isbn: "978-5-353-01234-5", coverUrl: "https://covers.openlibrary.org/b/isbn/9785353012345-L.jpg",
        description: "Первая книга легендарной серии о мальчике-волшебнике."
    },
    {
        title: "Шерлок Холмс. Полное собрание", author: "Артур Конан Дойл", authorId: "doyle",
        genre: "Детективы и триллеры", publisher: "Азбука", publisherId: "azbuka",
        price: 1200, oldPrice: 1500, rating: 5, reviewsCount: 85, badge: "sale", isNew: false,
        year: 2022, pages: 1152, isbn: "978-5-389-01234-6", coverUrl: "https://covers.openlibrary.org/b/isbn/9785389062563-L.jpg",
        description: "Все рассказы и повести о великом сыщике под одной обложкой."
    },
    {
        title: "Дюна", author: "Фрэнк Герберт", authorId: "herbert",
        genre: "Научная фантастика", publisher: "АСТ", publisherId: "ast",
        price: 550, oldPrice: null, rating: 4.7, reviewsCount: 64, badge: "bestseller", isNew: false,
        year: 2023, pages: 704, isbn: "978-5-17-098765-4", coverUrl: "https://covers.openlibrary.org/b/isbn/9785170987654-L.jpg",
        description: "Культовая сага о пустынной планете Арракис."
    },
    {
        title: "1984", author: "Джордж Оруэлл", authorId: "orwell",
        genre: "Антиутопия", publisher: "Азбука-Аттикус", publisherId: "azbuka",
        price: 380, oldPrice: null, rating: 4.9, reviewsCount: 210, badge: null, isNew: false,
        year: 2023, pages: 320, isbn: "978-5-389-12345-6", coverUrl: "https://covers.openlibrary.org/b/isbn/9785389025629-L.jpg",
        description: "Самый известный роман-антиутопия в мировой литературе."
    },
    {
        title: "Атомные привычки", author: "Джеймс Клир", authorId: "clear",
        genre: "Психология и саморазвитие", publisher: "Питер", publisherId: "piter",
        price: 690, oldPrice: 850, rating: 4.8, reviewsCount: 300, badge: "bestseller", isNew: true,
        year: 2024, pages: 320, isbn: "978-5-4461-1234-5", coverUrl: "https://covers.openlibrary.org/b/isbn/9785446112345-L.jpg",
        description: "Простой и проверенный способ сформировать хорошие привычки и избавиться от плохих."
    }
];

async function seed() {
    try {
        const categories = [...new Set(booksData.map(b => b.genre))];
        for (const catName of categories) {
            await Category.findOrCreate({ where: { name: catName } });
        }

        const allCats = await Category.findAll();
        const catMap = {};
        allCats.forEach(c => catMap[c.name] = c.id);

        for (const book of booksData) {
            const { genre, ...bookInfo } = book;
            await Book.findOrCreate({
                where: { isbn: book.isbn },
                defaults: { ...bookInfo, categoryId: catMap[genre] }
            });
        }

        console.log('Seed completed successfully');
    } catch (err) {
        console.error('Seed error:', err);
    }
}

module.exports = seed;
