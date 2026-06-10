// ============ SLIDER ============
const sliderData = [
    {
        title: "Action Unleashed",
        rating: "8.5",
        duration: "1h 30m",
        genres: ["Action", "Adventure", "Drama"],
        bgClass: "slide-bg-1"
    },
    {
        title: "Galactic Odyssey",
        rating: "7.9",
        duration: "2h 15m",
        genres: ["Sci-Fi", "Adventure", "Mystery"],
        bgClass: "slide-bg-2"
    },
    {
        title: "Shadows of the Past",
        rating: "9.1",
        duration: "1h 45m",
        genres: ["Thriller", "Drama", "Mystery"],
        bgClass: "slide-bg-3"
    },
    {
        title: "The Last Frontier",
        rating: "8.7",
        duration: "2h 05m",
        genres: ["Adventure", "Drama", "Action"],
        bgClass: "slide-bg-4"
    }
];

let currentSlide = 0;
let sliderInterval;
const SLIDE_DURATION = 5000;
let isPaused = false;

const sliderContainer = document.getElementById('sliderContainer');
const dotsContainer = document.getElementById('sliderDots');
const progressBar = document.getElementById('sliderProgress');
const heroSlider = document.getElementById('heroSlider');

// Render slides
sliderData.forEach((slide, index) => {
    const slideEl = document.createElement('div');
    slideEl.className = `slide ${slide.bgClass} ${index === 0 ? 'active' : ''}`;
    slideEl.innerHTML = `
        <div class="slide__rating">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFD700">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            ${slide.rating}
        </div>
        <h1 class="slide__title">${slide.title}</h1>
        <div class="slide__duration">Duration: ${slide.duration}</div>
        <div class="slide__genres">
            ${slide.genres.map((g, i) => `
                <span>${g}</span>
                ${i < slide.genres.length - 1 ? '<span class="slide__divider">|</span>' : ''}
            `).join('')}
        </div>
        <div class="slide__buttons">
            <button class="slide__button slide__button--primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>
                Play Now
            </button>
            <button class="slide__button slide__button--secondary">Trailer</button>
        </div>
    `;
    sliderContainer.appendChild(slideEl);
});

// Render dots
sliderData.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = `slider__dot ${index === 0 ? 'active' : ''}`;
    dot.onclick = () => goToSlide(index);
    dotsContainer.appendChild(dot);
});

function goToSlide(index) {
    const slides = sliderContainer.querySelectorAll('.slide');
    const dots = dotsContainer.querySelectorAll('.slider__dot');

    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    currentSlide = index;

    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');

    resetProgress();
}

function nextSlide() {
    const next = (currentSlide + 1) % sliderData.length;
    goToSlide(next);
}

function prevSlide() {
    const prev = (currentSlide - 1 + sliderData.length) % sliderData.length;
    goToSlide(prev);
}

function startSlider() {
    let elapsed = 0;
    const step = 50;

    sliderInterval = setInterval(() => {
        if (!isPaused) {
            elapsed += step;
            const progress = (elapsed / SLIDE_DURATION) * 100;
            progressBar.style.width = progress + '%';

            if (elapsed >= SLIDE_DURATION) {
                nextSlide();
                elapsed = 0;
            }
        }
    }, step);
}

function resetProgress() {
    progressBar.style.width = '0%';
}

// Pause on hover
heroSlider.addEventListener('mouseenter', () => { isPaused = true; });
heroSlider.addEventListener('mouseleave', () => { isPaused = false; });

// Touch support
let touchStartX = 0;
heroSlider.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    isPaused = true;
});
heroSlider.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide();
        else prevSlide();
    }
    isPaused = false;
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
});

// Button clicks
document.getElementById('prevSlide').addEventListener('click', prevSlide);
document.getElementById('nextSlide').addEventListener('click', nextSlide);

// Start slider
startSlider();

// Category Filters
const filterBtns = document.querySelectorAll('.filter__btn');
const movieCards = document.querySelectorAll('.movie-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('filter__btn--active'));
        btn.classList.add('filter__btn--active');

        const category = btn.dataset.category;
        movieCards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Pricing Toggle
const toggleBtns = document.querySelectorAll('.toggle__btn');
const monthlyPrices = document.querySelectorAll('.price-monthly');
const yearlyPrices = document.querySelectorAll('.price-yearly');

toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        toggleBtns.forEach(b => b.classList.remove('toggle__btn--active'));
        btn.classList.add('toggle__btn--active');

        const period = btn.dataset.period;
        if (period === 'monthly') {
            monthlyPrices.forEach(p => p.style.display = 'inline');
            yearlyPrices.forEach(p => p.style.display = 'none');
        } else {
            monthlyPrices.forEach(p => p.style.display = 'none');
            yearlyPrices.forEach(p => p.style.display = 'inline');
        }
    });
});

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq__item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq__question');
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('faq__item--active');

        faqItems.forEach(i => {
            i.classList.remove('faq__item--active');
            i.querySelector('.faq__answer').classList.remove('faq__answer--active');
        });

        if (!isActive) {
            item.classList.add('faq__item--active');
            item.querySelector('.faq__answer').classList.add('faq__answer--active');
        }
    });
});

// Modals
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');

function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    clearErrors();
}

function clearErrors() {
    document.querySelectorAll('.form__input').forEach(input => input.classList.remove('error'));
    document.querySelectorAll('.form__error').forEach(error => error.classList.remove('visible'));
}

document.getElementById('loginBtn').addEventListener('click', () => openModal(loginModal));
document.getElementById('signupBtn').addEventListener('click', () => openModal(signupModal));
document.getElementById('closeLogin').addEventListener('click', () => closeModal(loginModal));
document.getElementById('closeSignup').addEventListener('click', () => closeModal(signupModal));
document.getElementById('switchToSignup').addEventListener('click', () => {
    closeModal(loginModal);
    setTimeout(() => openModal(signupModal), 150);
});
document.getElementById('switchToLogin').addEventListener('click', () => {
    closeModal(signupModal);
    setTimeout(() => openModal(loginModal), 150);
});

loginModal.querySelector('.modal__overlay').addEventListener('click', () => closeModal(loginModal));
signupModal.querySelector('.modal__overlay').addEventListener('click', () => closeModal(signupModal));

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal(loginModal);
        closeModal(signupModal);
    }
});
const prevBtn = document.getElementById('prevSlide');
const nextBtn = document.getElementById('nextSlide');

if (prevBtn) {
    prevBtn.addEventListener('click', prevSlide);
}
if (nextBtn) {
    nextBtn.addEventListener('click', nextSlide);
}

// Form Validation
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

function showError(inputId, errorId) {
    document.getElementById(inputId).classList.add('error');
    document.getElementById(errorId).classList.add('visible');
}

function clearError(inputId, errorId) {
    document.getElementById(inputId).classList.remove('error');
    document.getElementById(errorId).classList.remove('visible');
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!validateEmail(email)) {
        showError('loginEmail', 'loginEmailError');
        isValid = false;
    } else {
        clearError('loginEmail', 'loginEmailError');
    }

    if (!validatePassword(password)) {
        showError('loginPassword', 'loginPasswordError');
        isValid = false;
    } else {
        clearError('loginPassword', 'loginPasswordError');
    }

    if (isValid) {
        alert('Login successful! Welcome to CineWave.');
        closeModal(loginModal);
    }
});

document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const terms = document.getElementById('signupTerms').checked;

    if (!validateEmail(email)) {
        showError('signupEmail', 'signupEmailError');
        isValid = false;
    } else {
        clearError('signupEmail', 'signupEmailError');
    }

    if (!validatePassword(password)) {
        showError('signupPassword', 'signupPasswordError');
        isValid = false;
    } else {
        clearError('signupPassword', 'signupPasswordError');
    }

    if (password !== confirmPassword) {
        showError('signupConfirmPassword', 'signupConfirmError');
        isValid = false;
    } else {
        clearError('signupConfirmPassword', 'signupConfirmError');
    }

    if (!terms) {
        document.getElementById('signupTermsError').classList.add('visible');
        isValid = false;
    } else {
        document.getElementById('signupTermsError').classList.remove('visible');
    }

    if (isValid) {
        alert('Registration successful! Welcome to CineWave.');
        closeModal(signupModal);
    }
});
// ============ AUTH & ROLES ============
const STORAGE_KEYS = {
    USERS: 'cinewave_users',
    CURRENT_USER: 'cinewave_current_user',
    MOVIES: 'cinewave_movies'
};

// Initialize default data
function initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        const defaultUsers = [
            {
                id: 1,
                name: 'Admin',
                email: 'admin@cinewave.com',
                password: 'admin123',
                role: 'admin'
            },
            {
                id: 2,
                name: 'John Doe',
                email: 'user@cinewave.com',
                password: 'user1234',
                role: 'user'
            }
        ];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem(STORAGE_KEYS.MOVIES)) {
        const defaultMovies = [
            {
                id: 1,
                title: 'Whispers in the Dark',
                genre: 'horror',
                year: 2023,
                duration: '1h 38m',
                price: '$89.99',
                rating: 8.5,
                ratings: [
                    { userId: 2, value: 9 },
                    { userId: 1, value: 8 }
                ]
            },
            {
                id: 2,
                title: 'Galactic Odyssey',
                genre: 'scifi',
                year: 2024,
                duration: '1h 25m',
                price: 'FREE',
                rating: 7.9,
                ratings: [
                    { userId: 2, value: 8 },
                    { userId: 1, value: 7.8 }
                ]
            },
            {
                id: 3,
                title: 'The Magic of Friendship',
                genre: 'family',
                year: 2024,
                duration: '2h 21m',
                price: 'FREE',
                rating: 7.5,
                ratings: [
                    { userId: 2, value: 7.5 }
                ]
            },
            {
                id: 4,
                title: 'Dinner Disaster',
                genre: 'comedy',
                year: 2023,
                duration: '1h 30m',
                price: '$49.99',
                rating: 8.2,
                ratings: [
                    { userId: 2, value: 8.5 },
                    { userId: 1, value: 7.9 }
                ]
            }
        ];
        localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(defaultMovies));
    }
}

// Функция для расчёта среднего рейтинга
function calculateAverageRating(ratings) {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.value, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
}

// Функция для добавления/обновления рейтинга
function addOrUpdateRating(movieId, userId, value) {
    let movies = getMovies();
    const movieIndex = movies.findIndex(m => m.id === movieId);

    if (movieIndex === -1) return false;

    const movie = movies[movieIndex];
    if (!movie.ratings) movie.ratings = [];

    // Проверяем, ставил ли уже этот пользователь оценку
    const existingRatingIndex = movie.ratings.findIndex(r => r.userId === userId);

    if (existingRatingIndex !== -1) {
        // Обновляем существующую оценку
        movie.ratings[existingRatingIndex].value = value;
    } else {
        // Добавляем новую оценку
        movie.ratings.push({ userId, value });
    }

    // Пересчитываем средний рейтинг
    movie.rating = calculateAverageRating(movie.ratings);

    movies[movieIndex] = movie;
    localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies));

    return true;
}

// Функция для получения оценки пользователя
function getUserRating(movieId, userId) {
    const movies = getMovies();
    const movie = movies.find(m => m.id === movieId);
    if (!movie || !movie.ratings) return null;

    const userRating = movie.ratings.find(r => r.userId === userId);
    return userRating ? userRating.value : null;
}
function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
}

function getMovies() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MOVIES)) || [];
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
}

function saveCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

function logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    updateHeaderForUser();
    document.getElementById('adminPanel').style.display = 'none';
    window.scrollTo(0, 0);
}

// Update header based on user role
function updateHeaderForUser() {
    const user = getCurrentUser();
    const headerActions = document.querySelector('.header__actions');

    if (user) {
        headerActions.innerHTML = `
            <button class="header__search" type="button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
            </button>
            <div class="user-badge">
                <span class="user-badge__name">${user.name}</span>
                <span class="user-badge__role user-badge__role--${user.role}">${user.role}</span>
            </div>
            <button class="header__login" type="button" id="logoutBtn">Logout</button>
        `;

        document.getElementById('logoutBtn').addEventListener('click', logout);

        // Show admin panel only for admins
        if (user.role === 'admin') {
            document.getElementById('adminPanel').style.display = 'block';
            renderAdminMovies();
            renderAdminUsers();
            updateAdminStats();
        } else {
            document.getElementById('adminPanel').style.display = 'none';
        }
    } else {
        headerActions.innerHTML = `
            <button class="header__search" type="button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
            </button>
            <button class="header__login" type="button" id="loginBtn">Login</button>
            <button class="header__signup" type="button" id="signupBtn">Sign Up</button>
        `;

        document.getElementById('loginBtn').addEventListener('click', () => openModal(loginModal));
        document.getElementById('signupBtn').addEventListener('click', () => openModal(signupModal));
    }
}


// Обработка входа
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
        const response = await fetch('process.php?action=login', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            localStorage.setItem('cinewave_current_user', JSON.stringify(result.data.user));
            closeModal(loginModal);

            // Показываем уведомление и обновляем
            const notification = document.createElement('div');
            notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        z-index: 9999;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
            notification.textContent = '✓ Welcome, ' + result.data.user.name + '!';
            document.body.appendChild(notification);

            setTimeout(() => {
                location.reload();
            }, 1500); // Обновление через 1.5 секунды
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Ошибка соединения с сервером');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Локальная валидация перед отправкой
    let isValid = true;
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm_password');

    if (!validateEmail(email)) {
        showError('signupEmail', 'signupEmailError');
        isValid = false;
    } else {
        clearError('signupEmail', 'signupEmailError');
    }

    if (!validatePassword(password)) {
        showError('signupPassword', 'signupPasswordError');
        isValid = false;
    } else {
        clearError('signupPassword', 'signupPasswordError');
    }

    if (password !== confirmPassword) {
        showError('signupConfirmPassword', 'signupConfirmError');
        isValid = false;
    } else {
        clearError('signupConfirmPassword', 'signupConfirmError');
    }

    if (!isValid) return;

    // Отправка на сервер
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';

    try {
        const response = await fetch('process.php?action=register', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            closeModal(signupModal);
            e.target.reset();
        } else {
            // Показываем ошибки с сервера
            if (result.errors) {
                Object.keys(result.errors).forEach(field => {
                    const errorId = field + 'Error';
                    const inputId = field === 'confirm_password' ? 'signupConfirmPassword' :
                        field === 'terms' ? 'signupTermsError' : 'signup' + capitalize(field);

                    if (document.getElementById(errorId)) {
                        document.getElementById(errorId).textContent = result.errors[field];
                        document.getElementById(errorId).classList.add('visible');
                    }
                });
            } else {
                alert(result.message);
            }
        }
    } catch (error) {
        alert('Ошибка соединения с сервером');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

document.querySelector('.newsletter__form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Subscribing...';

    try {
        const response = await fetch('process.php?action=subscribe', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            e.target.reset();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Ошибка соединения с сервером');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Вспомогательная функция
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
// Функция для обновления отображения фильмов
function renderMovies() {
    const movies = getMovies();
    const currentUser = getCurrentUser();
    const movieCards = document.querySelectorAll('.movie-card');

    if (movieCards.length === 0) return;

    movieCards.forEach((card, index) => {
        if (index >= movies.length) return;

        const movie = movies[index];
        const userRating = currentUser ? getUserRating(movie.id, currentUser.id) : null;
        const ratingCount = movie.ratings ? movie.ratings.length : 0;

        // Обновляем рейтинг
        const ratingEl = card.querySelector('.movie-card__rating');
        if (ratingEl) {
            ratingEl.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFD700">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                ${movie.rating.toFixed(1)}
                <span class="movie-card__rating-count">(${ratingCount})</span>
            `;
        }

        // Добавляем кнопку оценки если пользователь залогинен
        const footer = card.querySelector('.movie-card__footer');
        if (footer && currentUser) {
            // Удаляем старую кнопку если есть
            const oldBtn = card.querySelector('.movie-card__rate-btn');
            const oldYourRating = card.querySelector('.movie-card__your-rating');
            if (oldBtn) oldBtn.remove();
            if (oldYourRating) oldYourRating.remove();

            // Добавляем кнопку оценки
            const rateBtn = document.createElement('button');
            rateBtn.className = 'movie-card__rate-btn';
            rateBtn.textContent = userRating ? 'Change Rating' : 'Rate This';
            rateBtn.onclick = () => openRateModal(movie.id); // ← ВОТ ЭТО ВАЖНО!
            footer.appendChild(rateBtn);

            if (userRating) {
                const yourRating = document.createElement('div');
                yourRating.className = 'movie-card__your-rating';
                yourRating.innerHTML = `Your rating: ★ ${userRating}`;
                footer.appendChild(yourRating);
            }
        }
    });
}
// ============ ADMIN PANEL ============

// Admin tabs
const adminTabs = document.querySelectorAll('.admin-tab');
const adminTabContents = document.querySelectorAll('.admin-tab-content');

adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        adminTabs.forEach(t => t.classList.remove('active'));
        adminTabContents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
});

// Render movies table
function renderAdminMovies() {
    const movies = getMovies();
    const tbody = document.getElementById('moviesTableBody');

    tbody.innerHTML = movies.map(movie => `
        <tr>
            <td>${movie.title}</td>
            <td>${movie.genre}</td>
            <td>${movie.year}</td>
            <td>${movie.price}</td>
            <td>
                <button class="admin-btn admin-btn--danger" onclick="deleteMovie(${movie.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Render users table
function renderAdminUsers() {
    const users = getUsers();
    const tbody = document.getElementById('usersTableBody');

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="user-badge__role user-badge__role--${user.role}">${user.role}</span></td>
            <td>
                ${user.role !== 'admin' ? `<button class="admin-btn admin-btn--danger" onclick="deleteUser(${user.id})">Delete</button>` : '-'}
            </td>
        </tr>
    `).join('');
}

// Update stats
function updateAdminStats() {
    const users = getUsers();
    const movies = getMovies();

    document.getElementById('statUsers').textContent = users.length;
    document.getElementById('statMovies').textContent = movies.length;
}

// Add movie modal
const addMovieModal = document.getElementById('addMovieModal');
const addMovieBtn = document.getElementById('addMovieBtn');
const closeAddMovie = document.getElementById('closeAddMovie');
const adminLogout = document.getElementById('adminLogout');

addMovieBtn.addEventListener('click', () => openModal(addMovieModal));
closeAddMovie.addEventListener('click', () => closeModal(addMovieModal));
addMovieModal.querySelector('.modal__overlay').addEventListener('click', () => closeModal(addMovieModal));

adminLogout.addEventListener('click', logout);

// Add movie form
document.getElementById('addMovieForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const newMovie = {
        id: Date.now(),
        title: document.getElementById('movieTitle').value,
        genre: document.getElementById('movieGenre').value,
        year: parseInt(document.getElementById('movieYear').value),
        duration: document.getElementById('movieDuration').value,
        price: document.getElementById('moviePrice').value,
        rating: parseFloat(document.getElementById('movieRating').value)
    };

    const movies = getMovies();
    movies.push(newMovie);
    localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies));

    renderAdminMovies();
    updateAdminStats();
    closeModal(addMovieModal);
    e.target.reset();

    alert('Movie added successfully!');
});

// Global functions for onclick handlers
window.deleteMovie = function (id) {
    if (confirm('Are you sure you want to delete this movie?')) {
        let movies = getMovies();
        movies = movies.filter(m => m.id !== id);
        localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies));
        renderAdminMovies();
        updateAdminStats();
    }
};

window.deleteUser = function (id) {
    if (confirm('Are you sure you want to delete this user?')) {
        let users = getUsers();
        users = users.filter(u => u.id !== id);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        renderAdminUsers();
        updateAdminStats();
    }
};

// Initialize on page load
initializeStorage();
updateHeaderForUser();
// Вызываем после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    // ... существующий код ...
    renderMovies();
});

// ============ RATING SYSTEM ============
let currentRatingMovieId = null;
let selectedRatingValue = null;

const rateMovieModal = document.getElementById('rateMovieModal');
const closeRateMovie = document.getElementById('closeRateMovie');
const ratingStars = document.getElementById('ratingStars');
const ratingPreview = document.getElementById('ratingPreview');
const submitRatingBtn = document.getElementById('submitRating');
const rateMovieTitle = document.getElementById('rateMovieTitle');

function openRateModal(movieId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Please login to rate movies');
        openModal(loginModal);
        return;
    }

    currentRatingMovieId = movieId;
    const movies = getMovies();
    const movie = movies.find(m => m.id === movieId);

    if (!movie) return;

    rateMovieTitle.textContent = movie.title;
    selectedRatingValue = getUserRating(movieId, currentUser.id);

    updateStarDisplay();
    openModal(rateMovieModal);
}

function updateStarDisplay() {
    const stars = ratingStars.querySelectorAll('.star-btn');
    stars.forEach(star => {
        const value = parseInt(star.dataset.value);
        if (selectedRatingValue && value <= selectedRatingValue) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });

    if (selectedRatingValue) {
        ratingPreview.textContent = `You selected: ${selectedRatingValue}/10`;
        submitRatingBtn.disabled = false;
    } else {
        ratingPreview.textContent = 'Select your rating';
        submitRatingBtn.disabled = true;
    }
}

// Обработчики звёзд
ratingStars.querySelectorAll('.star-btn').forEach(star => {
    star.addEventListener('click', () => {
        selectedRatingValue = parseInt(star.dataset.value);
        updateStarDisplay();
    });

    star.addEventListener('mouseenter', () => {
        const hoverValue = parseInt(star.dataset.value);
        const stars = ratingStars.querySelectorAll('.star-btn');
        stars.forEach(s => {
            const v = parseInt(s.dataset.value);
            if (v <= hoverValue) {
                s.style.color = '#FFD700';
            } else {
                s.style.color = '';
            }
        });
    });
});

ratingStars.addEventListener('mouseleave', () => {
    updateStarDisplay();
});

// Отправка рейтинга
submitRatingBtn.addEventListener('click', () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentRatingMovieId || !selectedRatingValue) return;

    addOrUpdateRating(currentRatingMovieId, currentUser.id, selectedRatingValue);

    closeModal(rateMovieModal);
    renderMovies();

    // Обновляем админ-панель если открыта
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel && adminPanel.style.display !== 'none') {
        renderAdminMovies();
    }

    alert(`Rating submitted: ${selectedRatingValue}/10`);
});

// Закрытие модалки
closeRateMovie.addEventListener('click', () => closeModal(rateMovieModal));
rateMovieModal.querySelector('.modal__overlay').addEventListener('click', () => closeModal(rateMovieModal));
// ============ PASSWORD TOGGLE ============
document.querySelectorAll('.password-toggle').forEach(button => {
    button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const eyeOpen = this.querySelector('.eye-open');
        const eyeClosed = this.querySelector('.eye-closed');
        
        if (input.type === 'password') {
            input.type = 'text';
            eyeOpen.style.display = 'none';
            eyeClosed.style.display = 'block';
        } else {
            input.type = 'password';
            eyeOpen.style.display = 'block';
            eyeClosed.style.display = 'none';
        }
    });
});