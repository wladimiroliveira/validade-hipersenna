<?php
// Iniciar a sessão
session_start();

// Configurações iniciais para os cookies de sessão
session_set_cookie_params([
    'lifetime' => 1800,
    'secure' => true,   // True se estiver usando HTTPS
    'httponly' => true, // Impede o acesso ao cookie via JavaScript
    'samesite' => 'Strict' // Limita o envio de cookies a solicitações do mesmo site
]);

// Verifica se o usuário está logado.
if (!isset($_SESSION['logado']) || $_SESSION['logado'] !== true) {
    header('Location: ../login.php');
    exit();
}

// Define o tempo máximo de inatividade permitido (ex: 30 minutos)
$max_inatividade = 1800;  // em segundos

// Verifica se a variável de sessão foi definida
if (isset($_SESSION['ultimo_acesso']) && (time() - $_SESSION['ultimo_acesso'] > $max_inatividade)) {
    // Sessão expirou
    session_unset();   // Limpa as variáveis de sessão
    session_destroy(); // Destrói a sessão
    header('Location: ../login.php'); // Redireciona para a página de login
    exit;
}

// Regenera ID da sessão para prevenir ataques de fixação de sessão
session_regenerate_id(true);

// Atualiza o tempo de último acesso na sessão
$_SESSION['ultimo_acesso'] = time();

// Verifica se o usuário tem permissão para acessar
$permissoesPermitidas = ['a', 'u', 'e'];

if (!isset($_SESSION['user_permissao']) || !in_array($_SESSION['user_permissao'], $permissoesPermitidas)) {
    header('Location: ../home.php');
    exit();
}

// Inclui o arquivo de configuração
include('../config/config.php');
include('../config/navbar.php');

// --- Recupera Dados do Usuário da Sessão ---
// Usa o operador de coalescência nula (??) para fornecer um valor padrão se a variável de sessão não estiver definida
$user_filial = $_SESSION['user_filial'] ?? '';
$user_name = $_SESSION['nome_usuario'] ?? '';

// Converte a matrícula para inteiro, se existir, ou define como null
$matricula = isset($_SESSION['matricula']) ? (int) $_SESSION['matricula'] : null;

// Define a data atual no formato 'dia-Mês-Ano'
$data_lancamento = date('d-M-Y', strtotime('today'));

// --- Verificação de Matrícula (Opcional, mas recomendado para dados críticos) ---
// Interrompe a execução do script e exibe um erro se a matrícula for inválida
if ($matricula === null) {
    die("Erro: Matrícula do usuário não encontrada ou inválida.");
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./css/reset.css">    
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
    <link rel="stylesheet" href="../config/styles.css">
    <link rel="stylesheet" href="./css/style.css">
    <link rel="shortcut icon" href="./assets/img/icon/logo-icone.ico" type="image/x-icon">
    <title>Vencimento</title>
</head>
<body>
<header class="cabecalho">
    <?php include_once('../config/navbar.php')?>
</header>
<main class="conteudo">
<section class="section-filial">
    <h1>Selecione a filial</h1>
    <p>Selecione a filial desejada.</p>
    <div class="form-filial_container">
        <select class="form-select filial_select" id="filialSelect" aria-label="Default select example">
            <option selected disabled>Filial</option>
            <option value="1">1 - Matriz</option>
            <option value="2">2 - Faruk</option>
            <option value="3">3 - Carajas</option>
            <option value="4">4 - VS10</option>
            <option value="5">5 - Xinguara</option>
            <option value="6">6 - DP6</option>
            <option value="7">7 - Cidade Jardim</option>
            <!-- <option value="8">8 - Canaã</option> -->
        </select>
        <button class="btn btn-primary" id="filial-btn" type="submit">Próximo</button>
    </div>
</section>
</main>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
<script src="./js/dados.js"></script>
<script src="./js/filial.js"></script>
</body>
</html>