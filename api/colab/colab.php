<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Ler input só uma vez
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

// Pré-voo CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Autenticação
require_once __DIR__.'/../auth/authenticate.php';
// Conexão com o banco de dados
require_once __DIR__.'/../db/db.php';

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro na conexao com o banco de dados']);
    exit;
}

try {
    $input = json_decode($rawInput, true);
    if($input === null) {
        throw new Exception('Dados JSON invalidos', 400);
    }

    // Campos obrigatórios
    $requiredFields = ['nome', 'matricula'];
    foreach ($requiredFields as $field){
        if(empty($input[$field])) {
            throw new Exception("Campo '$field' é obrigatório", 400);
        }
    }

    // Inserção no banco de dados
    $stmt = $pdo->prepare("SELECT matricula FROM colab WHERE matricula = :matricula");
    $stmt->execute(['matricula' => $input['matricula']]);
    $colabExists = $stmt->fetch(PDO::FETCH_ASSOC);

    if($colabExists){
        // Cliente já existe, coleta o ID
        http_response_code(200);
        ob_end_clean();
        echo json_encode([
            'sucesso' => true,
            'mensagem' => 'Colaborador já cadastrado',
            'id' => $colabExists['id']
        ]);
        exit;
    }

    // Inserir novo colaborador
    $stmt = $pdo->prepare("INSERT INTO colab (nome, matricula) VALUES (:nome, :matricula)");
    $stmt->execute([
        'nome' => $input['nome'],
        'matricula' => $input['matricula']
    ]);

    $novoId = $pdo->lastInsertId();

    http_response_code(200);
    ob_end_clean();
    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Colaborador cadastrado com sucesso',
        'id' => $novoId
    ]);
    exit;
} catch (Exception $e) {
    // Captura erros e retorna mensagem apropriada
    http_response_code($e->getCode() ?: 500);
    ob_end_clean();
    echo json_encode([
        'sucesso' => false,
        'mensagem' => $e->getMessage()
    ]);
    exit;
}