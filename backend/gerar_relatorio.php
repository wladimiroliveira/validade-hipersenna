<?php
// /backend/gerar_relatorio.php (VERSÃO ATUALIZADA)

require_once('./vendor/autoload.php');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['dados_visiveis'])) {
    http_response_code(400);
    die('Erro: Dados não recebidos corretamente.');
}

$json_data = $_POST['dados_visiveis'];
$data = json_decode($json_data, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    die('Erro: JSON inválido.');
}

class MeuPDF extends TCPDF {
    public function Header() {
        $this->SetFont('helvetica', 'B', 14);
        $this->Cell(0, 15, 'Relatório de Produtos e Validades', 0, false, 'C', 0, '', 0, false, 'M', 'M');
        $this->SetLineStyle(['width' => 0.2, 'color' => [0, 0, 0]]);
        $this->Line(10, 25, $this->getPageWidth() - 10, 25);
    }

    public function Footer() {
        $this->SetY(-15);
        $this->SetFont('helvetica', 'I', 8);
        $date = new DateTime("now", new DateTimeZone("America/Sao_Paulo"));
        $this->Cell(0, 10, 'Gerado em: ' . $date->format('d/m/Y H:i:s'), 0, false, 'L');
        $this->Cell(0, 10, 'Página ' . $this->getAliasNumPage() . '/' . $this->getAliasNbPages(), 0, false, 'R', 0, '', 0, false, 'T', 'M');
    }
}

// MUDANÇA 1: Orientação para Paisagem ('L' de Landscape)
$pdf = new MeuPDF('L', PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

$pdf->SetCreator(PDF_CREATOR);
$pdf->SetAuthor('Seu Sistema');
$pdf->SetTitle('Relatório de Produtos');
$pdf->SetSubject('Dados da tabela filtrada');

$pdf->setHeaderFont(['helvetica', 'B', 12]);
$pdf->setFooterFont(['helvetica', 'I', 8]);

$pdf->SetMargins(10, 28, 10);
$pdf->SetHeaderMargin(15);
$pdf->SetFooterMargin(15);

$pdf->AddPage();

$pdf->SetFont('helvetica', '', 9); // Fonte um pouco menor para caber mais colunas

// Montar a tabela HTML que será inserida no PDF
$html = '<style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #dee2e6; padding: 5px; }
            th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
         </style>';
$html .= '<table>
            <thead>
                <tr>
                    <th style="width:15%;">Cód. Prod.</th>
                    <th style="width:40%;">Descrição</th>
                    <th style="width:15%;">Dt. Validade</th>
                    <th style="width:15%;">Qtd. Entrada</th>
                    <th style="width:15%;">Qtd. Conf.</th>
                </tr>
            </thead>
            <tbody>';

if (empty($data)) {
    // MUDANÇA 3: Colspan atualizado para 5 colunas
    $html .= '<tr><td colspan="5" style="text-align:center;">Nenhum dado visível para gerar o relatório.</td></tr>';
} else {
    foreach ($data as $row) {
        $html .= '<tr>
                    <td style="text-align:center; width:15%">' . htmlspecialchars($row['codprod']) . '</td>
                    <td style="width:40%;">' . htmlspecialchars($row['descricao']) . '</td>
                    <td style="text-align:center; width:15%">' . htmlspecialchars($row['validade']) . '</td>
                    <td style="text-align:center; width:15%">' . htmlspecialchars($row['qtd']) . '</td>
                    <td style="text-align:center; width:15%">' . htmlspecialchars($row['qtconf']) . '</td>
                  </tr>';
    }
}

$html .= '</tbody></table>';

$pdf->writeHTML($html, true, false, true, false, '');

$pdf->Output('relatorio_validade.pdf', 'I');