<?php
// Arquivo: consultaValidade.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");

// Lê o corpo da requisição
$dados = json_decode(file_get_contents("php://input"), true);

// Token de autenticação
$token = '59d8e4d941e54db90cf9a5808be9e61c';

// Envia para a API PHP
$ch = curl_init('http://localhost/validade_hipersenna/api/consultar.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dados));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
curl_close($ch);

echo $response;