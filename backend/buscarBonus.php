<?php
// Arquivo: consultaValidade.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type");

// Lê o corpo da requisição
$dados = json_decode(file_get_contents("php://input"), true);

// Token de autenticação
$token = 'f152bc9090bcf7684142f1db156d9ffa';

// Envia para a API PHP
$ch = curl_init($_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'].'/dev_assets/api/bonus/bonus.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dados));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);

$response = curl_exec($ch);
curl_close($ch);

file_put_contents('api_debug.log', "Resposta: $response\n", FILE_APPEND);

echo $response;