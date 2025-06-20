<?php 
$host = 'srv458.hstgr.io';
$user = 'u355029116_dev';
$pass = 'H1p3r2enn4@db';
$dbname = 'u355029116_hipersennadb';
$charset = 'utf8mb4';
$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE               => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE    => PDO::FETCH_ASSOC
];

$conn;

/* function conectar() {
    global $dsn, $user, $pass, $options;
    try {
        $conn = new PDO($dsn, $user, $pass, $options);
        return $conn;
    } catch (PDOException $e) {
        echo "Erro de conexão: " . $e->getMessage();
        exit;
    }
} */