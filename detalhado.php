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
$permissoesPermitidas = ['a', 'e'];

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
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="./css/painel.css">
    <link rel="stylesheet" href="./css/relatorios/tabela.css">
    <link rel="stylesheet" href="./css/relatorios/loading.css">
    <link rel="stylesheet" href="./css/analise/tabela-feature.css">
    <link rel="shortcut icon" href="./assets/img/icon/logo-icone.ico" type="image/x-icon">
    <title>Painel Vencimento</title>
</head>
<body>
<header class="cabecalho">
    <?php include_once('../config/navbar.php')?>
</header>
<main class="conteudo">
    <div id="loadingOverlay" class="loading-overlay hidden">
        <div class="spinner"></div>
    </div>

    <section class="intro_container">
        <h1 class="m-4">Relatório detalhado</h1>
        <p>Realize a consulta dos dados necessários abaixo.</p>
    </section>
    <section class="filtro_container">
        <div class="select_container">
            <div class="tipo_container">
                <label for="tipo"><strong>Buscar dados por:</strong></label>
                <select class="form-select" id="selectControl" aria-label="Default select example">
                    <option selected disabled>Selecione uma modalidade</option>
                    <option value="diasParaVencer">Qt dias para vencer</option>
                    <option value="dataIntervalo">Intervalo de data</option>
                </select>
            </div>
            <div class="filial_container">
                <label for="filial"><strong>Filial *</strong></label>
                <select class="form-select" id="filial" name="filial" aria-label="Default select example" required>
                    <option selected value="todas">Todas</option>
                    <option value="1">1 - Matriz</option>
                    <option value="2">2 - Faruk</option>
                    <option value="3">3 - Carajás</option>
                    <option value="4">4 - VS10</option>
                    <option value="5">5 - Xinguara</option>
                    <option value="6">6 - DP6</option>
                    <option value="7">7 - Cidade Jardim</option>
                    <!-- <option value="8">8 - Canaã</option> -->
                </select>
            </div>
            
        </div>
        <div class="info_container" id="infoContainer">
            
        </div>
        <div class="button_container">
            <a href="<?php echo $_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'].'/vencimento/hub.php'; ?>" class="btn btn-secondary">Voltar</a>
            <button type="button" class="btn btn-primary" id="botaoConsultar">Consultar</button>
            <button type="button" class="btn btn-success btn_export-csv" id="exportar"><img src="./assets/img/icon/002-excel.png" alt="Excel"></button>
        </div>
    </section>
    <div class="result_container">
        <div id="table-controls" style="display: none; margin-bottom: 15px;">
            <div class="dropdown-container">
                <button class="dropdown-button">Exibir/Ocultar Colunas</button>
                <div id="column-toggle-menu" class="dropdown-menu">
                    </div>
            </div>
        </div>
        <div id="resultContainer"></div>
    </div>
</main>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js" integrity="sha384-j1CDi7MgGQ12Z7Qab0qlWQ/Qqz24Gc6BM0thvEMVjHnfYGF0rmFCozFSxQBxwHKO" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js"></script>
<script src="./js/painel.js"></script>
<script src="./js/relatorio/relatorioDetalhado.js"></script>
<script src="./js/analise/tabela-feature.js"></script>
</body>
</html>