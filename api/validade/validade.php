<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Ler input só uma vez
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

// Pré-voo CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
// Conexão com o banco de dados
require_once __DIR__.'/../../db/db.php';

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro na conexao com o banco de dados']);
    exit;
}

try {
    // Receber dados JSON
    $input = json_decode(file_get_contents("php://input"), true);

    // Lógica para dias para vencer
    if (isset($input['paraVencer'])) {
        $dias = intval($input['paraVencer']);
        $dataAlvo = date('Y-m-d', strtotime("+$dias days"));

        if ($input['filial'] == 'todas'){
            $sql = "
            SELECT 
                vp.cod_produto AS codprod,
                p.descricao,
                vp.data_validade,
                SUM(vp.quantidade) AS quantidade,
                vp.cod_filial AS filial
            FROM validade_produto vp
            JOIN produtos p ON p.id = vp.cod_produto
            WHERE vp.data_validade = :dataAlvo
            GROUP BY vp.cod_produto, vp.data_validade, vp.cod_filial
            ORDER BY vp.cod_produto, vp.data_validade
            ";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':dataAlvo', $dataAlvo);
        } else {
            $sql = "
            SELECT 
                vp.cod_produto AS codprod,
                p.descricao,
                vp.data_validade,
                SUM(vp.quantidade) AS quantidade,
                vp.cod_filial AS filial
            FROM validade_produto vp
            JOIN produtos p ON p.id = vp.cod_produto
            WHERE vp.data_validade = :dataAlvo AND vp.cod_filial = :filial
            GROUP BY vp.cod_produto, vp.data_validade, vp.cod_filial
            ORDER BY vp.cod_produto, vp.data_validade
            ";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':dataAlvo' => $dataAlvo,
                ':filial' => $input['filial']
            ]);
        }

        

    } elseif (isset($input['intervaloData'])) {
        $ini = $input['intervaloData']['dataIni'];
        $fim = $input['intervaloData']['dataFim'];

        if (!$ini || !$fim) {
            echo json_encode([]);
            exit;
        }

        if( $input['filial'] == 'todas') {
            $sql = "
            SELECT 
                vp.cod_produto AS codprod,
                p.descricao,
                vp.data_validade,
                SUM(vp.quantidade) AS quantidade,
                vp.cod_filial AS filial
            FROM validade_produto vp
            JOIN produtos p ON p.id = vp.cod_produto
            WHERE vp.data_validade BETWEEN :ini AND :fim
            GROUP BY vp.cod_produto, vp.data_validade
            ORDER BY vp.cod_produto, vp.data_validade
                ";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':ini', $ini);
            $stmt->bindValue(':fim', $fim);
        } else {
            $sql = "
            SELECT 
                vp.cod_produto AS codprod,
                p.descricao,
                vp.data_validade,
                SUM(vp.quantidade) AS quantidade,
                vp.cod_filial AS filial
            FROM validade_produto vp
            JOIN produtos p ON p.id = vp.cod_produto
            WHERE vp.data_validade BETWEEN :ini AND :fim AND vp.cod_filial = :filial
            GROUP BY vp.cod_produto, vp.data_validade, vp.cod_filial
            ORDER BY vp.cod_produto, vp.data_validade
            ";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':ini' => $ini,
                ':fim' => $fim,
                ':filial' => $input['filial']
            ]);
        }

    } else {
        echo json_encode([]);
        exit;
    }

    // Executar e retornar
    $stmt->execute();
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($resultados);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro na consulta ao banco de dados: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro: ' . $e->getMessage()]);
}