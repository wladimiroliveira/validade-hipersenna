<?php 
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Para requisições OPTIONS (pré-voo CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Receber os dados do JavaScript
$json = file_get_contents('php://input');
$dados = json_decode($json, true);

if ($dados === null) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'JSON invalido']);
    exit;
}

// Validar os dados recebidos
$erros = [];

if (empty($dados['user']['nome'])) $erros[] = "Nome e obrigatorio";
if (empty($dados['user']['matricula'])) $erros[] = "Matricula e obrigatoria";
if (empty($dados['user']['filial'])) $erros[] = "Filial e obrigatoria";
if (empty($dados['prod']['itens']) || !is_array($dados['prod']['itens']) || count($dados['prod']['itens']) === 0) {
    $erros[] = "Pelo menos um produto deve ser informado";
} else {
    foreach ($dados['prod']['itens'] as $item) {
        if (empty($item['codprod'])) $erros[] = "Codigo do produto e obrigatorio";
        if (empty($item['descricao'])) $erros[] = "Descricao e obrigatoria";
        if (empty($item['validade'])) $erros[] = "Data de validade e obrigatoria";
        if (empty($item['quantidade'])) $erros[] = "Quantidade e obrigatoria";
    }
}

if (!empty($erros)){
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erros de validacao', 'erros' => $erros]);
    exit;
}

$user = [
    'nome' => $dados['user']['nome'],
    'matricula' => $dados['user']['matricula'],
    'filial' => $dados['user']['filial']
];

$colabToken = '2f5cf3d19453e8c3027ac6f9d6b3972b'; // colabToken

// Configurações das APIs
$urlColab = 'https://hipersenna.com.br/dev_assets/api/colab/colab.php';
$urlValidade = 'https://hipersenna.com.br/dev_assets/api/validade/validade.php';

// Função para enviar dados para a API
function sendDados($url, $dados, $colabToken){
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dados));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $colabToken
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    file_put_contents('api_debug.log', "HTTP Code: $httpCode\n", FILE_APPEND);
    file_put_contents('api_debug.log', "Resposta: $response\n", FILE_APPEND);

    curl_close($ch);

    $json = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        file_put_contents('api_debug.log', "JSON inválido recebido: $response\n", FILE_APPEND);
        $json = null;
    }

    return [
        'httpCode' => $httpCode,
        'response' => $json
    ];
};

// Enviar dados do usuário
$colabResponse = sendDados($urlColab, $user, $colabToken);

if ($colabResponse['httpCode'] !== 200) {
    http_response_code(500);
    echo json_encode([
        'sucesso' => false, 
        'mensagem' => 'Erro ao cadastrar cliente',
        'detalhes' => $colabResponse['response'] ?? null,
        'debug' => [
            'url_api' => $urlColab,
            'dados_enviados' => $dados['cliente'],
            'resposta_http' => $colabResponse['httpCode'],
            'resposta_completa' => $colabResponse
        ]
    ]);
    exit;
}

// Enviar dados de validade
$prods = [
    'itens' => $dados['prod']['itens'],
    'colab_id' => $colabResponse['response']['id'] ?? null,
    'filial' => $dados['user']['filial']
];

$validadeResponse = sendDados($urlValidade, $prods, $colabToken);
if ($validadeResponse['httpCode'] !== 200) {
    http_response_code(500);
    echo json_encode([
        'sucesso' => false, 
        'mensagem' => 'Erro ao cadastrar validade',
        'detalhes' => $validadeResponse['response'] ?? null,
        'debug' => [
            'url_api' => $urlValidade,
            'dados_enviados' => $dados['prod']['itens'],
            'resposta_http' => $validadeResponse['httpCode'],
            'resposta_completa' => $validadeResponse
        ]
    ]);
    exit;
}

echo json_encode([
    'sucesso' => true,
    'mensagem' => 'Dados cadastrados com sucesso',
    'colab_id' => $colabResponse['response']['id'] ?? null,
    'validade_id' => $validadeResponse['response']['id'] ?? null
]);

exit;