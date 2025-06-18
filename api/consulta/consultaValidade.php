<?php


// Coleta e interpreta os dados da requisição
$input = json_decode(file_get_contents("php://input"), true);

// Define consulta e parâmetros
if (isset($input['paraVencer'])) {
    $dias = intval($input['paraVencer']);
    $dataAlvo = date('Y-m-d', strtotime("+$dias days"));

    $sql = "
        SELECT 
            validade_produto.cod_produto AS codprod,
            produtos.descricao,
            validade_produto.data_validade,
            SUM(validade_produto.quantidade) AS quantidade,
            validade_produto.cod_filial AS filial
        FROM 
            validade_produto
        JOIN 
            produtos ON produtos.id = validade_produto.cod_produto
        WHERE 
            validade_produto.data_validade = ?
        GROUP BY 
            validade_produto.cod_produto,
            validade_produto.data_validade,
            validade_produto.cod_filial
        ORDER BY 
            validade_produto.cod_produto,
            validade_produto.data_validade
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $dataAlvo);

} elseif (isset($input['intervaloData'])) {
    $ini = $input['intervaloData']['dataIni'];
    $fim = $input['intervaloData']['dataFim'];

    // Validação simples das datas
    if (!$ini || !$fim) {
        echo json_encode([]);
        exit;
    }

    $sql = "
        SELECT 
            validade_produto.cod_produto AS codprod,
            produtos.descricao,
            validade_produto.data_validade,
            SUM(validade_produto.quantidade) AS quantidade,
            validade_produto.cod_filial AS filial
        FROM 
            validade_produto
        JOIN 
            produtos ON produtos.id = validade_produto.cod_produto
        WHERE 
            validade_produto.data_validade BETWEEN ? AND ?
        GROUP BY 
            validade_produto.cod_produto,
            validade_produto.data_validade,
            validade_produto.cod_filial
        ORDER BY 
            validade_produto.cod_produto,
            validade_produto.data_validade
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $ini, $fim);

} else {
    echo json_encode([]);
    exit;
}

// Executa consulta
$stmt->execute();
$result = $stmt->get_result();

// Prepara saída
$saida = [];
while ($row = $result->fetch_assoc()) {
    $saida[] = $row;
}

echo json_encode($saida);