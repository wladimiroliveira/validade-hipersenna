<?php
// /backend/gerar_relatorio.php

// 1. Carregar o autoload do Composer para usar a biblioteca TCPDF
require_once('./vendor/autoload.php');

// Verificação de segurança: garantir que os dados foram enviados via POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['dados_visiveis'])) {
    http_response_code(400);
    die('Erro: Dados não recebidos corretamente.');
}

// 2. Receber e decodificar os dados JSON enviados pelo JavaScript
$json_data = $_POST['dados_visiveis'];
$data = json_decode($json_data, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    die('Erro: JSON inválido.');
}

// ---------------------------------------------------------
// 3. CONFIGURAÇÃO E CRIAÇÃO DO PDF COM TCPDF
// ---------------------------------------------------------

// Classe estendida para criar Cabeçalho e Rodapé personalizados
class MeuPDF extends TCPDF {
    // Cabeçalho da página
    public function Header() {
        $this->SetFont('helvetica', 'B', 14);
        $this->Cell(0, 15, 'Relatório de Produtos e Validades', 0, false, 'C', 0, '', 0, false, 'M', 'M');
        $this->SetLineStyle(['width' => 0.2, 'color' => [0, 0, 0]]);
        $this->Line(10, 25, $this->getPageWidth() - 10, 25);
    }

    // Rodapé da página
    public function Footer() {
        $this->SetY(-15);
        $this->SetFont('helvetica', 'I', 8);
        // Data de geração
        $date = new DateTime("now", new DateTimeZone("America/Sao_Paulo"));
        $this->Cell(0, 10, 'Gerado em: ' . $date->format('d/m/Y H:i:s'), 0, false, 'L');
        // Número da página
        $this->Cell(0, 10, 'Página ' . $this->getAliasNumPage() . '/' . $this->getAliasNbPages(), 0, false, 'R', 0, '', 0, false, 'T', 'M');
    }
}

// Instanciar o novo documento PDF
$pdf = new MeuPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

// Definir informações do documento
$pdf->SetCreator(PDF_CREATOR);
$pdf->SetAuthor('Seu Sistema');
$pdf->SetTitle('Relatório de Produtos');
$pdf->SetSubject('Dados da tabela filtrada');

// Definir cabeçalho e rodapé
$pdf->setHeaderFont(['helvetica', 'B', 12]);
$pdf->setFooterFont(['helvetica', 'I', 8]);

// Definir margens
$pdf->SetMargins(10, 28, 10); // Esquerda, Topo (maior por causa do cabeçalho), Direita
$pdf->SetHeaderMargin(15);
$pdf->SetFooterMargin(15);

// Adicionar uma página
$pdf->AddPage();

// Definir a fonte para o conteúdo
$pdf->SetFont('helvetica', '', 10);

// 4. Montar a tabela HTML que será inserida no PDF
$html = '<style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #dee2e6; padding: 6px; }
            th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
         </style>';
$html .= '<table>
            <thead>
                <tr>
                    <th style="width:15%;">Cód. Prod.</th>
                    <th style="width:45%;">Descrição</th>
                    <th style="width:20%;">Dt. Validade</th>
                    <th style="width:20%;">Qtd. Entrada</th>
                </tr>
            </thead>
            <tbody>';

if (empty($data)) {
    $html .= '<tr><td colspan="4" style="text-align:center;">Nenhum dado visível para gerar o relatório.</td></tr>';
} else {
    foreach ($data as $row) {
        $html .= '<tr>
                    <td style="text-align:center; width:15%;">' . htmlspecialchars($row['codprod']) . '</td>
                    <td style="width:45%;">' . htmlspecialchars($row['descricao']) . '</td>
                    <td style="text-align:center; width:20%;">' . htmlspecialchars($row['validade']) . '</td>
                    <td style="text-align:center; width:20%;">' . htmlspecialchars($row['qtd']) . '</td>
                  </tr>';
    }
}

$html .= '</tbody></table>';

// 5. Escrever o HTML no PDF e gerar o arquivo
$pdf->writeHTML($html, true, false, true, false, '');

// Fechar e enviar o documento para o navegador
// 'I': Envia o arquivo inline para o navegador. O navegador usará um plugin de visualização ou solicitará o download.
// 'D': Força o download do arquivo.
$pdf->Output('relatorio_validade.pdf', 'I');