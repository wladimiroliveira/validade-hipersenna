<?php 
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Para requisições OPTIONS (pré-voo CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Receber os dados do JavaScript
$json = file_get_contents('php://input');
$dados = json_decode($json, true);

if ($dados === null) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'JSON invalido']);
    exit;
}

$token = '55bd0f4499d2b2bf1556a95438f1e677';

// Envia para a API PHP
$ch = curl_init($_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'].'/dev_assets/api/validade/editar_tratativa_status.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dados));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);

$response = curl_exec($ch);
curl_close($ch);

echo $response;