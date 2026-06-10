<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed');
}

// Получаем данные
$email = sanitize($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

// Валидация
$errors = [];

if (empty($email)) {
    $errors[] = 'Email is required';
} elseif (!validateEmail($email)) {
    $errors[] = 'Invalid email format';
}

if (empty($password)) {
    $errors[] = 'Password is required';
} elseif (!validatePassword($password)) {
    $errors[] = 'Password must be at least 8 characters';
}

if (!empty($errors)) {
    jsonResponse(false, implode(', ', $errors));
}

// Проверка на админа
if ($email === 'admin' && $password === 'admin') {
    $_SESSION['user'] = [
        'id' => 1,
        'name' => 'Admin',
        'email' => 'admin@cinewave.com',
        'role' => 'admin'
    ];
    logAction('LOGIN', "Admin login successful");
    jsonResponse(true, 'Login successful', ['role' => 'admin']);
}

// Проверка обычных пользователей
$users = readFromFile('users.txt');
$user = null;

foreach ($users as $u) {
    if ($u['email'] === $email && $u['password'] === $password) {
        $user = $u;
        break;
    }
}

if ($user) {
    $_SESSION['user'] = $user;
    logAction('LOGIN', "User login: {$user['email']}");
    jsonResponse(true, 'Login successful', ['role' => $user['role'] ?? 'user']);
} else {
    logAction('LOGIN_FAILED', "Invalid credentials: $email");
    jsonResponse(false, 'Invalid email or password');
}
?>