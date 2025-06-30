<?php
header('Content-Type: application/json');

// Conexão com o banco de dados
require_once __DIR__.'/../db/db.php';

$conn = new mysqli($host, $usuario, $senha, $banco);

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    ob_end_clean();
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro na conexão com o banco de dados']);
    exit;
}

// Validação do parâmetro
if (isset($_GET['codprod']) && is_numeric($_GET['codprod'])) {
    $codprod = intval($_GET['codprod']);

    try {
        $stmt = $pdo->prepare("SELECT descricao FROM produtos WHERE id = :codprod");
        $stmt->bindParam(':codprod', $codprod, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $descricao = $stmt->fetchColumn();
            echo json_encode(['sucesso' => true, 'descricao' => $descricao]);
        } else {
            echo json_encode(['sucesso' => false, 'mensagem' => 'Produto não encontrado']);
        }
    } catch (PDOException $e) {
        echo json_encode(['sucesso' => false, 'erro' => 'Erro na consulta: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Código inválido ou não informado']);
}
