<?php
// process.php - Обработчик форм CineWave

// Разрешаем CORS для локальной разработки
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Обработка OPTIONS запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Путь к файлу хранения данных
define('DATA_DIR', __DIR__ . '/data');
define('USERS_FILE', DATA_DIR . '/users.txt');
define('LOG_FILE', DATA_DIR . '/actions.log');

// Создаём папку data если её нет
if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

// Создаём файл если его нет
if (!file_exists(USERS_FILE)) {
    file_put_contents(USERS_FILE, '');
}

// Функция для записи в лог
function writeLog($action, $data = []) {
    $log = date('Y-m-d H:i:s') . " | " . $action . " | " . json_encode($data) . " | IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
    file_put_contents(LOG_FILE, $log, FILE_APPEND | LOCK_EX);
}

// Функция для чтения пользователей
function getUsers() {
    if (!file_exists(USERS_FILE)) return [];
    $content = file_get_contents(USERS_FILE);
    if (empty($content)) return [];
    
    $users = [];
    $lines = explode("\n", trim($content));
    foreach ($lines as $line) {
        if (!empty($line)) {
            $users[] = json_decode($line, true);
        }
    }
    return $users;
}

// Функция для сохранения пользователя
function saveUser($user) {
    $content = file_get_contents(USERS_FILE);
    $content .= json_encode($user) . "\n";
    file_put_contents(USERS_FILE, $content, LOCK_EX);
}

// Функция валидации
function validate($data) {
    $errors = [];
    
    // Валидация имени
    if (isset($data['name'])) {
        $name = trim($data['name']);
        if (empty($name)) {
            $errors['name'] = 'Имя обязательно для заполнения';
        } elseif (mb_strlen($name) < 2) {
            $errors['name'] = 'Имя должно содержать минимум 2 символа';
        } elseif (mb_strlen($name) > 50) {
            $errors['name'] = 'Имя не должно превышать 50 символов';
        } elseif (!preg_match('/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/u', $name)) {
            $errors['name'] = 'Имя может содержать только буквы';
        }
    }
    
    // Валидация email
    if (isset($data['email'])) {
        $email = trim($data['email']);
        if (empty($email)) {
            $errors['email'] = 'Email обязателен для заполнения';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Введите корректный email адрес';
        } elseif (!preg_match('/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/', $email)) {
            $errors['email'] = 'Email должен содержать действительный домен';
        }
    }
    
    // Валидация пароля
    if (isset($data['password'])) {
        $password = $data['password'];
        if (empty($password)) {
            $errors['password'] = 'Пароль обязателен для заполнения';
        } elseif (strlen($password) < 8) {
            $errors['password'] = 'Пароль должен содержать не менее 8 символов';
        } elseif (strlen($password) > 128) {
            $errors['password'] = 'Пароль не должен превышать 128 символов';
        } elseif (!preg_match('/[A-Z]/', $password)) {
            $errors['password'] = 'Пароль должен содержать хотя бы одну заглавную букву';
        } elseif (!preg_match('/[a-z]/', $password)) {
            $errors['password'] = 'Пароль должен содержать хотя бы одну строчную букву';
        } elseif (!preg_match('/[0-9]/', $password)) {
            $errors['password'] = 'Пароль должен содержать хотя бы одну цифру';
        }
    }
    
    // Валидация подтверждения пароля
    if (isset($data['confirm_password'])) {
        if ($data['password'] !== $data['confirm_password']) {
            $errors['confirm_password'] = 'Пароли не совпадают';
        }
    }
    
    return $errors;
}

// Обработка запроса
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'register':
            handleRegister();
            break;
        case 'login':
            handleLogin();
            break;
        case 'subscribe':
            handleSubscribe();
            break;
        default:
            sendError('Неизвестное действие', 400);
    }
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}

// ============ ОБРАБОТЧИКИ ============

function handleRegister() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Метод не разрешён', 405);
    }
    
    $data = [
        'name' => $_POST['name'] ?? '',
        'email' => $_POST['email'] ?? '',
        'password' => $_POST['password'] ?? '',
        'confirm_password' => $_POST['confirm_password'] ?? '',
        'terms' => $_POST['terms'] ?? ''
    ];
    
    // Валидация
    $errors = validate($data);
    
    // Проверка согласия с условиями
    if (empty($data['terms'])) {
        $errors['terms'] = 'Необходимо принять условия использования';
    }
    
    if (!empty($errors)) {
        sendError('Ошибка валидации', 422, $errors);
    }
    
    // Проверяем существование email
    $users = getUsers();
    foreach ($users as $user) {
        if ($user['email'] === $data['email']) {
            sendError('Пользователь с таким email уже существует', 409);
        }
    }
    
    // Создаём нового пользователя
    $newUser = [
        'id' => uniqid('user_', true),
        'name' => htmlspecialchars(trim($data['name']), ENT_QUOTES, 'UTF-8'),
        'email' => htmlspecialchars(trim($data['email']), ENT_QUOTES, 'UTF-8'),
        'password' => password_hash($data['password'], PASSWORD_DEFAULT),
        'role' => 'user',
        'created_at' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR']
    ];
    
    saveUser($newUser);
    writeLog('REGISTER', ['email' => $newUser['email']]);
    
    sendSuccess('Регистрация прошла успешно', ['user' => $newUser['name']]);
}

function handleLogin() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Метод не разрешён', 405);
    }
    
    $data = [
        'email' => $_POST['email'] ?? '',
        'password' => $_POST['password'] ?? ''
    ];
    
    // Валидация
    $errors = [];
    if (empty($data['email'])) {
        $errors['email'] = 'Email обязателен для заполнения';
    }
    if (empty($data['password'])) {
        $errors['password'] = 'Пароль обязателен для заполнения';
    }
    
    if (!empty($errors)) {
        sendError('Ошибка валидации', 422, $errors);
    }
    
    // Поиск пользователя
    $users = getUsers();
    $foundUser = null;
    
    foreach ($users as $user) {
        if ($user['email'] === $data['email']) {
            $foundUser = $user;
            break;
        }
    }
    
    // Проверка пароля
    if (!$foundUser || !password_verify($data['password'], $foundUser['password'])) {
        writeLog('LOGIN_FAILED', ['email' => $data['email']]);
        sendError('Неверный email или пароль', 401);
    }
    
    writeLog('LOGIN_SUCCESS', ['email' => $foundUser['email']]);
    
    sendSuccess('Вход выполнен успешно', [
        'user' => [
            'name' => $foundUser['name'],
            'email' => $foundUser['email'],
            'role' => $foundUser['role']
        ]
    ]);
}

function handleSubscribe() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Метод не разрешён', 405);
    }
    
    $email = trim($_POST['email'] ?? '');
    
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('Введите корректный email', 422, ['email' => 'Некорректный email']);
    }
    
    // Сохраняем подписчиков в отдельный файл
    $subscribersFile = DATA_DIR . '/subscribers.txt';
    $content = date('Y-m-d H:i:s') . ' | ' . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "\n";
    file_put_contents($subscribersFile, $content, FILE_APPEND | LOCK_EX);
    
    writeLog('SUBSCRIBE', ['email' => $email]);
    
    sendSuccess('Вы успешно подписались на рассылку!');
}

// ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============

function sendSuccess($message, $data = []) {
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

function sendError($message, $code = 400, $errors = []) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $message,
        'errors' => $errors
    ], JSON_UNESCAPED_UNICODE);
    exit();
}