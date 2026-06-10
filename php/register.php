<?php
session_start();

// Функция валидации email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Функция валидации пароля (минимум 8 символов)
function validatePassword($password) {
    return strlen($password) >= 8;
}

// Функция проверки существующего email
function emailExists($email, $file) {
    if (!file_exists($file)) return false;
    
    $users = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($users as $user) {
        $data = explode('|', $user);
        if (isset($data[1]) && $data[1] === $email) {
            return true;
        }
    }
    return false;
}

$errors = [];
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirmPassword'] ?? '';
    $terms = isset($_POST['terms']);
    
    // Валидация имени
    if (empty($name)) {
        $errors[] = 'Name is required';
    }
    
    // Валидация email
    if (empty($email)) {
        $errors[] = 'Email is required';
    } elseif (!validateEmail($email)) {
        $errors[] = 'Invalid email format';
    }
    
    // Валидация пароля
    if (empty($password)) {
        $errors[] = 'Password is required';
    } elseif (!validatePassword($password)) {
        $errors[] = 'Password must be at least 8 characters';
    }
    
    // Проверка совпадения паролей
    if ($password !== $confirmPassword) {
        $errors[] = 'Passwords do not match';
    }
    
    // Проверка согласия с условиями
    if (!$terms) {
        $errors[] = 'You must accept the terms of service';
    }
    
    // Проверка существующего email
    $usersFile = __DIR__ . '/data/users.txt';
    if (emailExists($email, $usersFile)) {
        $errors[] = 'Email already registered';
    }
    
    // Если ошибок нет - сохраняем в файл
    if (empty($errors)) {
        $userData = [
            date('Y-m-d H:i:s'), // дата регистрации
            $email,
            $name,
            sha1($password), // хешируем пароль
            'user' // роль по умолчанию
        ];
        
        $line = implode('|', $userData) . "\n";
        
        if (file_put_contents($usersFile, $line, FILE_APPEND | LOCK_EX) !== false) {
            $success = 'Registration successful! You can now login.';
            $_SESSION['registered'] = true;
        } else {
            $errors[] = 'Failed to save user data';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - CineWave</title>
    <link rel="stylesheet" href="styles/style.css">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: #0a0a0a;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
        }
        .register-container {
            background: #1a1a1a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 32px;
            max-width: 448px;
            width: 100%;
        }
        .register-container h2 {
            font-size: 24px;
            margin-bottom: 8px;
        }
        .register-container .subtitle {
            font-size: 14px;
            color: #9ca3af;
            margin-bottom: 24px;
        }
        .form-group {
            margin-bottom: 16px;
        }
        .form-group label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #d1d5db;
            margin-bottom: 4px;
        }
        .form-group input {
            width: 100%;
            padding: 12px 16px;
            background: #0a0a0a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            color: #ffffff;
            font-size: 14px;
            outline: none;
            box-sizing: border-box;
        }
        .form-group input:focus {
            border-color: #EC3343;
        }
        .form-group input.error {
            border-color: #EC3343;
        }
        .error-list {
            background: rgba(236, 51, 67, 0.1);
            border: 1px solid rgba(236, 51, 67, 0.3);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
            list-style: none;
        }
        .error-list li {
            color: #EC3343;
            font-size: 13px;
            margin-bottom: 4px;
        }
        .success-message {
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid rgba(34, 197, 94, 0.3);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
            color: #22c55e;
            font-size: 14px;
        }
        .checkbox-group {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 16px;
            font-size: 14px;
            color: #9ca3af;
        }
        .checkbox-group input {
            margin-top: 2px;
            accent-color: #EC3343;
        }
        .checkbox-group a {
            color: #EC3343;
        }
        .submit-btn {
            width: 100%;
            padding: 12px;
            background: #EC3343;
            border: none;
            border-radius: 12px;
            color: #ffffff;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.3s;
        }
        .submit-btn:hover {
            background: #c82a38;
        }
        .login-link {
            text-align: center;
            margin-top: 24px;
            font-size: 14px;
            color: #9ca3af;
        }
        .login-link a {
            color: #EC3343;
            text-decoration: none;
        }
        .login-link a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="register-container">
        <h2>Create Account</h2>
        <p class="subtitle">Join CineWave and start watching</p>
        
        <?php if (!empty($errors)): ?>
            <ul class="error-list">
                <?php foreach ($errors as $error): ?>
                    <li>• <?php echo htmlspecialchars($error); ?></li>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>
        
        <?php if ($success): ?>
            <div class="success-message"><?php echo htmlspecialchars($success); ?></div>
        <?php endif; ?>
        
        <form method="POST" action="register.php">
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" name="name" 
                       value="<?php echo isset($_POST['name']) ? htmlspecialchars($_POST['name']) : ''; ?>"
                       placeholder="Your name" required>
            </div>
            
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" 
                       value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>"
                       placeholder="example@domain.com" required>
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" 
                       placeholder="Minimum 8 characters" required>
            </div>
            
            <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" 
                       placeholder="Repeat password" required>
            </div>
            
            <label class="checkbox-group">
                <input type="checkbox" name="terms" <?php echo isset($_POST['terms']) ? 'checked' : ''; ?> required>
                <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
            </label>
            
            <button type="submit" class="submit-btn">Sign Up</button>
        </form>
        
        <div class="login-link">
            Already have an account? <a href="login.php">Login</a>
        </div>
    </div>
</body>
</html>