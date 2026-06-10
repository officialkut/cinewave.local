<?php
// php/config.php
session_start();

// Настройки
define('DATA_DIR', __DIR__ . '/../data/');
define('LOG_FILE', DATA_DIR . 'log.txt');

// Создаём папку data если не существует
if (!file_exists(DATA_DIR)) {
    mkdir(DATA_DIR, 0777, true);
}

// Функция для записи в текстовый файл
function saveToFile($filename, $data) {
    $filepath = DATA_DIR . $filename;
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    return file_put_contents($filepath, $json . "\n", FILE_APPEND | LOCK_EX);
}

// Функция для чтения из текстового файла
function readFromFile($filename) {
    $filepath = DATA_DIR . $filename;
    if (!file_exists($filepath)) {
        return [];
    }
    $content = file_get_contents($filepath);
    $lines = array_filter(explode("\n", $content));
    $data = [];
    foreach ($lines as $line) {
        $decoded = json_decode($line, true);
        if ($decoded !== null) {
            $data[] = $decoded;
        }
    }
    return $data;
}

// Функция для валидации email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Функция для валидации пароля (минимум 8 символов)
function validatePassword($password) {
    return strlen($password) >= 8;
}

// Функция для санитизации данных
function sanitize($data) {
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// Функция для логирования
function logAction($action, $details = '') {
    $log = date('Y-m-d H:i:s') . " - $action";
    if ($details) {
        $log .= " | $details";
    }
    file_put_contents(LOG_FILE, $log . "\n", FILE_APPEND | LOCK_EX);
}

// Функция для возврата JSON ответа
function jsonResponse($success, $message, $data = null) {
    header('Content-Type: application/json; charset=utf-8');
    $response = [
        'success' => $success,
        'message' => $message
    ];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}
?>