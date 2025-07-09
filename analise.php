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
    <link rel="shortcut icon" href="./assets/img/icon/logo-icone.ico" type="image/x-icon">
    <title>Painel Vencimento</title>
</head>
<body>
<header class="cabecalho">
    <!-- <?php include_once('../config/navbar.php')?> -->
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
                    <div class="filtros_container">
                        <div class="fornecedor_container">
                            <label for="fornecedor" class="form-label">Fornecedor</label>
                            <input type="number" class="form-control" id="fornecedor">
                        </div>
                        <div class="secao_container">
                            <label for="fornecedor" class="form-label">Seção</label>
                            <input type="number" class="form-control" id="secao">
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
                </div>
            </form>
        </div>
    </section>
    <section class="sec_result">
        <div class="result_container"></div>
    </section>
</main>

<script src="./js/analise/pesquisa.js"></script>
</body>
</html>