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
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js" integrity="sha384-j1CDi7MgGQ12Z7Qab0qlWQ/Qqz24Gc6BM0thvEMVjHnfYGF0rmFCozFSxQBxwHKO" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="./css/success.css">
    <link rel="shortcut icon" href="./assets/img/icon/logo-icone.ico" type="image/x-icon">
    <title>Vencimento</title>
</head>
<body>
<header class="cabecalho">
    <nav class="navigation">
        <div class="logo">
            <img src="./assets/img/logo-hipersenna.png" alt="Logo do HiperSenna">
        </div>
    </nav>
</header>
<main class="conteudo">
    <section class="info">
        <div class="info__titulo_container">
            <h1 class="info_titulo">Sucesso</h1>
            <p class="info_texto">Seus dados foram inseridos com sucesso</p>
            <a href="./index.php"><button class="btn btn-primary">Voltar para o início</button></a>
        </div>
    </section>
</main>
</body>
</html>