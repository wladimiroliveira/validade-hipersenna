<?php 
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Para requisições OPTIONS (pré-voo CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Receber os dados do JavaScript
$json = file_get_contents('php://input');
$dados = json_decode($json, true);
error_log("Requisição recebida: " . $_SERVER['REQUEST_METHOD']);
error_log("Dados recebidos: " . $json);


if ($dados === null) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'JSON inválido']);
    exit;
} else {
    http_response_code(200);
}

$nome = $dados['user']['nome'] ?? '';
$matricula = $dados['user']['matricula'] ?? '';
$codprod = $dados['prod']['codprod'] ?? '';
$validade = $dados['prod']['validade'] ?? '';

$token = "2f5cf3d19453e8c3027ac6f9d6b3972b";

// 1. Tenta cadastrar o colaborador
$colabApiUrl = 'https://hipersenna.com.br/dev_assets/api/colab/colab.php';

$headers = [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
];

$ch = curl_init($colabApiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['nome' => $nome, 'matricula' => $matricula]));
curl_setopt($ch, CURLOPT_HEADER, true);

$response = curl_exec($ch);
$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$header = substr($response, 0, $header_size);
$body = substr($response, $header_size);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$colabData = json_decode($body, true);

if ($http_code === 200 && isset($colabData['id'])) {
    // Colaborador cadastrado com sucesso
    $colab_id = $colabData['id'];
} elseif ($http_code === 409) {
    // Matrícula já cadastrada, buscar o id pelo GET
    $ch = curl_init($colabApiUrl . '?matricula=' . urlencode($matricula));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $body = curl_exec($ch);
    curl_close($ch);

    $colabData = json_decode($body, true);
    if (is_array($colabData) && isset($colabData[0]['id'])) {
        $colab_id = $colabData[0]['id'];
    } elseif (is_array($colabData) && isset($colabData['id'])) {
        $colab_id = $colabData['id'];
    } else {
        http_response_code(500);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Não foi possível obter o ID do colaborador.']);
        exit;
    }
} else {
    http_response_code(500);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao cadastrar colaborador.']);
    exit;
}

echo json_encode(['sucesso' => true, 'colab_id' => $colab_id]);