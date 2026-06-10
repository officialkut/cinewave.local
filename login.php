<?php
session_start();

$errors = [];
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $remember = isset($_POST['remember']);
    
    // Валидация email
    if (empty($email)) {
        $errors[] = 'Email is required';
    }
    
    // Валидация пароля
    if (empty($password)) {
        $errors[] = 'Password is required';
    } elseif (strlen($password) < 8) {
        $errors[] = 'Password must be at least 8 characters';
    }
    
    // Проверка админа (admin/admin)
    if ($email === 'admin' && $password === 'admin') {
        $_SESSION['user'] = [
            'name' => 'Admin',
            'email' => 'admin@cinewave.com',
            'role' => 'admin'
        ];
        header('Location: index.html');
        exit;
    }
    
    // Поиск пользователя в файле
    if (empty($errors)) {
        $usersFile = __DIR__ . '/data/users.txt';
        $userFound = false;
        
        if (file_exists($usersFile)) {
            $users = file($usersFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($users as $user) {
                $data = explode('|', $user);
                if (count($data) >= 4) {
                    $fileEmail = $data[1];
                    $filePassword = $data[3];
                    
                    if ($fileEmail === $email && $filePassword === sha1($password)) {
                        $_SESSION['user'] = [
                            'name' => $data[2],
                            'email' => $data[1],
                            'role' => $data[4] ?? 'user'
                        ];
                        $userFound = true;
                        break;
                    }
                }
            }
        }
        
        if ($userFound) {
            header('Location: index.html');
            exit;
        } else {
            $errors[] = 'Invalid email or password';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - CineWave</title>
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
        .login-container {
            background: #1a1a1a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 32px;
            max-width: 448px;
            width: 100%;
        }
        .login-container h2 {
            font-size: 24px;
            margin-bottom: 8px;
        }
        .login-container .subtitle {
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
        .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            font-size: 14px;
        }
        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #9ca3af;
            cursor: pointer;
        }
        .checkbox-label input {
            accent-color: #EC3343;
        }
        .forgot-link {
            color: #EC3343;
            text-decoration: none;
        }
        .forgot-link:hover {
            text-decoration: underline;
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
        .register-link {
            text-align: center;
            margin-top: 24px;
            font-size: 14px;
            color: #9ca3af;
        }
        .register-link a {
            color: #EC3343;
            text-decoration: none;
        }
        .register-link a:hover {
            text-decoration: underline;
        }
        .admin-hint {
            background: rgba(236, 51, 67, 0.1);
            border: 1px solid rgba(236, 51, 67, 0.3);
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 12px;
            color: #d1d5db;
            margin-bottom: 16px;
        }
        .admin-hint strong {
            color: #EC3343;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h2>Login to Your Account</h2>
        <p class="subtitle">Enter your credentials to access CineWave</p>
        
        <?php if (!empty($errors)): ?>
            <ul class="error-list">
                <?php foreach ($errors as $error): ?>
                    <li>• <?php echo htmlspecialchars($error); ?></li>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>
        
        <div class="admin-hint">
            Admin: <strong>admin</strong> / <strong>admin</strong>
        </div>
        
        <form method="POST" action="login.php">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" 
                       value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>"
                       placeholder="example@domain.com" required>
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" 
                       placeholder="••••••••" required>
            </div>
            
            <div class="form-options">
                <label class="checkbox-label">
                    <input type="checkbox" name="remember">
                    <span>Remember me</span>
                </label>
                <a href="#" class="forgot-link">Forgot password?</a>
            </div>
            
            <button type="submit" class="submit-btn">Login</button>
        </form>
        
        <div class="register-link">
            Don't have an account? <a href="register.php">Sign Up</a>
        </div>
    </div>
</body>
</html>