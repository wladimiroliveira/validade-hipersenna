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

// Trata os dados recebidos

try {
    $input = json_decode($rawInput, true);
    if($input === null) {
        throw new Exception('Dados JSON invalidos', 400);
    }

    // Campos obrigatórios
    $requiredFields = ['codprod', 'descricao', 'validade', 'quantidade'];
    foreach ($input['itens'] as $item) {
        foreach ($requiredFields as $field) {
            if (empty($item[$field])) {
                throw new Exception("Campo '$field' é obrigatório para o produto {$item['codprod']}", 400);
            }
        }
    }

    // Adicionar informações na tabela validade_produto
    foreach ($input['itens'] as $item) {
        $stmt = $pdo->prepare("INSERT INTO validade_produto (cod_produto, data_validade, quantidade, cod_filial, colaborador_id) VALUES (:codprod, :validade, :quantidade, :filial, :colab_id)");
        $stmt->execute([
            'codprod' => $item['codprod'],
            'validade' => $item['validade'],
            'quantidade' => $item['quantidade'],
            'filial' => $input['filial'],
            'colab_id' => $input['colab_id']
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
    }
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    ob_end_clean();
    echo json_encode(['sucesso' => false, 'mensagem' => $e->getMessage()]);
    exit;
}