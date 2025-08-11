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
    <link rel="stylesheet" href="./css/relatorios/detalhado.css">
    <link rel="stylesheet" href="./css/relatorios/simples.css">
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
            <div class="top_container">
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
            <div class="dataInsercao_container" id="dataInsercaoContainer">
                <span>Data de inserção</span>
                <div class="inputs_container">
                    <div class="data_ini">
                        <label for="dataInsertIni">Data inicial</label>
                        <input type="date" class="form-control" id="dataInsertIni" name="dataInsercao">
                    </div>
                    <div class="data_fim">
                        <label for="dataInsertFim">Data final</label>
                        <input type="date" class="form-control" id="dataInsertFim" name="dataInsercao">
                    </div>
                </div>
            </div>
            <div class="produto_container">
                <label for="produto"><strong>Produto:</strong></label>
                <input type="number" class="form-control" name="produto" id="produto">
                <div class="retorno_container">
                    <p class="result_descricao"></p>
                </div>
            </div>            
        </div>
        <div class="info_container" id="infoContainer"></div>
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
<script src="./js/descricao.js"></script>
</body>
</html>