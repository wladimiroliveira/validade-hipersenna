<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

error_log("Requisição recebida: " . $_SERVER['REQUEST_METHOD']);
error_log("Dados recebidos: " . $rawInput);

// Ler input só uma vez
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

// Pré-voo CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

error_log("Conexão com o banco realizada com sucesso.");

// Autenticação
require_once __DIR__.'/../auth/authenticate.php';
// Conexão com o banco de dados
require_once __DIR__.'/../db/db.php';

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro na conexão com o banco de dados']);
    exit;
}

// CRUD
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        error_log("Entrou no case: " . $_SERVER['REQUEST_METHOD']);
        // READ (listar todos ou um)
        if (isset($_GET['matricula'])) {
            error_log("Executando query: SELECT * FROM colaboradores WHERE matricula = " . ($_GET['matricula'] ?? 'N/A'));
            $stmt = $pdo->prepare("SELECT * FROM colaboradores WHERE matricula = ?");
            $stmt->execute([$_GET['matricula']]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($result ?: []);
        } else {
            $stmt = $pdo->query("SELECT * FROM colaboradores");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        error_log("Entrou no case: " . $_SERVER['REQUEST_METHOD']);
        // CREATE
        if (!isset($data['nome']) || !isset($data['matricula'])) {
            http_response_code(400);
            echo json_encode(['sucesso' => false, 'mensagem' => 'Dados incompletos']);
            exit;
        }
        // Verifica se já existe matrícula igual
        error_log("Executando query: SELECT * FROM colaboradores WHERE matricula = " . ($_GET['matricula'] ?? 'N/A'));
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM colaboradores WHERE matricula = ?");
        $stmt->execute([$data['matricula']]);
        if ($stmt->fetchColumn() > 0) {
            http_response_code(409); // Conflito
            echo json_encode(['sucesso' => false, 'mensagem' => 'Matrícula já cadastrada']);
            exit;
        }
        error_log("Executando query: SELECT * FROM colaboradores WHERE matricula = " . ($_GET['matricula'] ?? 'N/A'));
        $stmt = $pdo->prepare("INSERT INTO colaboradores (nome, matricula) VALUES (?, ?)");
        $sucesso = $stmt->execute([$data['nome'], $data['matricula']]);
        echo json_encode(['sucesso' => $sucesso, 'id' => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        error_log("Entrou no case: " . $_SERVER['REQUEST_METHOD']);
        // UPDATE
        parse_str(file_get_contents("php://input"), $put_vars);
        $id = $put_vars['id'] ?? $data['id'] ?? null;
        $nome = $put_vars['nome'] ?? $data['nome'] ?? null;
        $matricula = $put_vars['matricula'] ?? $data['matricula'] ?? null;
        if (!$id || !$nome || !$matricula) {
            http_response_code(400);
            echo json_encode(['sucesso' => false, 'mensagem' => 'Dados incompletos']);
            exit;
        }
        error_log("Executando query: SELECT * FROM colaboradores WHERE matricula = " . ($_GET['matricula'] ?? 'N/A'));
        $stmt = $pdo->prepare("UPDATE colaboradores SET nome = ?, matricula = ? WHERE id = ?");
        $sucesso = $stmt->execute([$nome, $matricula, $id]);
        echo json_encode(['sucesso' => $sucesso]);
        break;

    case 'DELETE':
        error_log("Entrou no case: " . $_SERVER['REQUEST_METHOD']);
        // DELETE
        parse_str(file_get_contents("php://input"), $del_vars);
        $id = $del_vars['id'] ?? $data['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['sucesso' => false, 'mensagem' => 'ID não informado']);
            exit;
        }
        error_log("Executando query: SELECT * FROM colaboradores WHERE matricula = " . ($_GET['matricula'] ?? 'N/A'));
        $stmt = $pdo->prepare("DELETE FROM colaboradores WHERE id = ?");
        $sucesso = $stmt->execute([$id]);
        echo json_encode(['sucesso' => $sucesso]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido']);
        break;
}