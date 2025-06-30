<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./css/reset.css">    
    <!-- Bootstrap Bundle JS (inclui o Popper.js) -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
    <link rel="stylesheet" href="../config/styles.css">
    <link rel="stylesheet" href="./css/style.css?=v2">
    <link rel="stylesheet" href="./css/formProd.css?=v3">
    <link rel="shortcut icon" href="./assets/img/icon/logo-icone.ico" type="image/x-icon">
    <title>Vencimento</title>
    <script>
        window.userDataFromPHP = <?php
            echo json_encode([
                'nome' => $user_name,
                'matricula' => $matricula,
                'filial' => $user_filial
            ]);
        ?>;        
        console.log("Dados do usuário do PHP carregados:", window.userDataFromPHP);
    </script>
</head>
<body>
<header class="cabecalho">
    <?php include_once('../config/navbar.php')?>
    <!-- <nav class="navigation">
        <div class="logo">
            <img src="./assets/img/logo-hipersenna.png" alt="Logo do HiperSenna">
        </div>
        <div class="user-info" style="margin-left: auto; padding-right: 20px; color: white;">
            Olá, <strong><?= htmlspecialchars($user_name) ?></strong> (Matrícula: <?= htmlspecialchars($matricula) ?>) - Filial: <strong><?= htmlspecialchars($user_filial) ?></strong>
        </div>
    </nav> -->
</header>
<main class="conteudo">
<div class="dados_container">
    <ul>
        <li id="userNome"><?php echo $user_name ;?></li>
        <li id="userMatricula"><?php echo $matricula ;?></li>
        <li id="userFilial"><?php echo $user_filial ;?></li>
    </ul>
</div>
<section class="validade">
    <h1 class="titulo">Validade</h1>
    <p>Insira as informações dos produtos abaixo</p>
    <div class="inserir_validade form_container">
        <form class="form__validade_prod">
            <div class="mb-3 line">
                <label for="codProd" class="form-label">Código do produto</label>
                <div class="input_container">
                    <input type="number" class="form-control" id="codProd">
                    <div class="result_container">
                        <p class="result_descricao"></p>
                    </div>
                </div>
                <div class="data-quantidade_container">
                    <div class="input__data_container">
                        <label for="data">Data de validade</label>
                        <input type="date" name="data" id="data" class="form-control" placeholder="DD/MM/AAAA">
                    </div>
                    <div class="input__quantidade_container">
                        <label for="quantidade">Quantidade</label>
                        <input type="number" name="quantidade" id="quantidade" class="form-control">
                    </div>
                </div>
                <button type="submit" class="btn btn-secondary" id="prodInserir">Inserir</button>
                <div class="form-text">Digite o código do produto e espere o sistema encontrar a descrição correta</div>
            </div>
            <div class="list__prod_container table-responsive">
                <table class="table table-striped text-nowrap" id="produtos">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Código</th>
                            <th scope="col">Desc</th>
                            <th scope="col">Dt. Validade</th>
                            <th scope="col">Quant.</th>
                            <th scope="col">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="produtosList">
                             
                    </tbody>
                </table>
            </div>
            <div class="button_container">
                <a href="./index.php"><button type="button" class="btn btn-secondary">Voltar</button></a>
                <button type="submit" class="btn btn-primary" id="next">Enviar</button>
            </div>
        </form>
    </div>
</section>
</main>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
<script src="./js/dados.js" defer></script>
<script src="./js/formProd.js" defer></script>
<script src="./js/descricao.js" defer></script>
</body>
</html>