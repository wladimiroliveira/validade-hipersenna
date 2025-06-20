<?php
// Arquivo: consultaValidade.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Lê o corpo da requisição
$dados = json_decode(file_get_contents("php://input"), true);

// Token de autenticação
$token = '671d4e4430334ee77d6d36257ac66fb7';

// Envia para a API PHP
$ch = curl_init('https://hipersenna.com.br/dev_assets/api/consultaValidade/consultaValidade.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dados));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);

$response = json_encode(['response' => curl_exec($ch)]);
curl_close($ch);

echo $response;