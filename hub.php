<!DOCTYPE html>
<html lang="pt-br">
<head>
    <link rel="stylesheet" href="/css/reset.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">
    <link rel="shortcut icon" href="./assets/img/icon/logo-icone.ico" type="image/x-icon">
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="./css/painel.css">
    <link rel="stylesheet" href="./css/relatorios/hub.css">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vencimento</title>
</head>
<body>
<header class="cabecalho">
    <?php include_once('../config/navbar.php')?>
</header>
<main class="conteudo">
<section class="intro">
    <div class="intro__titulo_container">
        <h1 class="intro_titulo text-center m-4">Relatórios</h1>
    </div>
    <div class="card_container">
        <a href="./simples.php" style="text-decoration: none;">
            <div class="card" style="width: 18rem;">
                <img src="./assets/img/Relatório Simples com Gráfico de Barras.png" class="card-img-top" alt="Relatório simples">
                <div class="card-body">
                    <p class="card-text"><strong>Relatório simples</strong>. Utilize este relatório quando estiver precisando apenas visualizar os registros.</p>
                </div>
            </div>
        </a>
        <a href="./detalhado.php" style="text-decoration: none;">
            <div class="card" style="width: 18rem;">
                <img src="./assets/img/ChatGPT Image 30 de jun. de 2025, 11_21_03.png" class="card-img-top" alt="Relatório detalhado">
                <div class="card-body">
                    <p class="card-text"><strong>Relatório detalhado</strong>. Utilize este relatório quando quiser realizar consultas detalhadas e delegar vistorias.</p>
                </div>
            </div>
        </a>
    </div>
</section>
</main>
<footer class="rodape">

</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js" integrity="sha384-j1CDi7MgGQ12Z7Qab0qlWQ/Qqz24Gc6BM0thvEMVjHnfYGF0rmFCozFSxQBxwHKO" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
</body>
</html>