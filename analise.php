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
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="./css/painel.css">
    <link rel="stylesheet" href="./css/relatorios/tabela.css">
    <link rel="stylesheet" href="./css/analise/analise.css">
    <link rel="stylesheet" href="./css/analise/loading.css">
    <link rel="shortcut icon" href="./assets/img/icon/logo-icone.ico" type="image/x-icon">
    <title>Painel Vencimento</title>
</head>
<body>
<!-- 🔄 Overlay de Loading -->
<div id="loadingOverlay" class="loading-overlay hidden">
    <div class="spinner"></div>
    <p>Carregando dados, por favor aguarde...</p>
</div>
<header class="cabecalho">
    <!-- <?php include_once('../config/navbar.php')?>-->
</header>
<main class="conteudo">
    <section class="sec_intro">
        <h1 class="intro_titulo">Análise Vencimento</h1>
    </section>
    <section class="sec_pesquisa">
        <div class="pesquisar_bonus form_container">
            <form class="form_pesquisa">
                <div class="mb-3 line item_container">
                    <div class="line_filial-bonus">
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
                        <div class="numbonus_container">
                            <label for="numBonus" class="form-label">Nº Bônus</label>
                            <input type="number" class="form-control" id="numBonus">
                        </div>
                    </div>
                    <div class="data_container">
                        <div class="data-range_container">
                            <h4 class="data-range_titulo">Data de validade</h4>
                            <div class="data-ini_container">
                                <label for="data-ini">Data inicial</label>
                                <input type="date" name="data-ini" id="data-ini" class="form-control">
                            </div>
                            <div class="data-fim_container">
                                <label for="data-fim">Data fim</label>
                                <input type="date" name="data-fim" id="data-fim" class="form-control" placeholder="DD/MM/AAAA">
                            </div>
                        </div>
                    </div>
                    <!-- <div class="data_container">
                        <div class="data-range_container">
                            <h4 class="data-range_titulo">Data do bônus</h4>
                            <div class="data-ini_container">
                                <label for="data-ini">Data inicial</label>
                                <input type="date" name="data-ini" id="data-ini_bonus" class="form-control">
                            </div>
                            <div class="data-fim_container">
                                <label for="data-fim">Data fim</label>
                                <input type="date" name="data-fim" id="data-fim_bonus" class="form-control" placeholder="DD/MM/AAAA">
                            </div>
                        </div>
                    </div> -->
                    <div class="filtros_container">
                        <!-- <div class="fornecedor_container">
                            <label for="fornecedor" class="form-label">Fornecedor</label>
                            <input type="number" class="form-control" id="fornecedor">
                        </div> -->
                        <div class="departamento_container">
                            <label for="fornecedor" class="form-label">Departamento</label>
                            <input type="number" class="form-control" id="departamento">
                        </div>
                        <div class="produto_container">
                            <label for="fornecedor" class="form-label">Produto</label>
                            <input type="number" class="form-control" id="produto">
                        </div>
                    </div>
                </div>
                <div class="button_container">
                    <a href="./index.php"><button type="button" class="btn btn-secondary">Voltar</button></a>
                    <button type="submit" class="btn btn-primary" id="pesquisar">Pesquisar</button>
                    <button type="button" class="btn btn-danger" id="limpar">Limpar</button>
                    <button type="button" class="btn btn-success" id="exportar">Exportar</button>
                </div>
            </form>
        </div>
    </section>
    <section class="sec_result">
        <div class="result_container" id="resultContainer"></div>
    </section>
</main>

<script src="./js/analise/pesquisa.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js"></script>
</body>
</html>