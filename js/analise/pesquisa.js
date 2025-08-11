const gerarPdfBtn = document.getElementById('gerar-pdf-btn');
const pesquisar = document.getElementById('pesquisar');
const limparBtn = document.getElementById('limpar');
const exportarBtn = document.getElementById('exportar');
const resultContainer = document.getElementById('resultContainer');
const analiseDados = {
    filial: '',
    bonus: '',
    fornecedor: '',
    secao: '',
    departamento: '',
    produto: '',
    data: {
        inicial: '',
        final: ''
    },
    dataBonus: {
        inicial: '',
        final: ''
    }
};

// VERSÃO ATUALIZADA - Substitua a sua função por esta
async function gerarRelatorioPDF() {
    console.log("Iniciando gerarRelatorioPDF...");

    const tabela = document.getElementById('resultTable');
    if (!tabela) {
        alert("A tabela de resultados não foi encontrada.");
        console.error("Tabela com ID 'resultTable' não encontrada.");
        return;
    }

    const headers = [...tabela.querySelectorAll('thead th')];
    const linhas = tabela.querySelectorAll('tbody tr');
    const dadosParaPdf = [];

    // 1. Encontrar dinamicamente o índice de cada coluna necessária
    const indiceColunas = {
        codprod: headers.findIndex(th => th.textContent.trim().includes('CODPROD')),
        descricao: headers.findIndex(th => th.textContent.trim().includes('DESCRIÇÃO')),
        validade: headers.findIndex(th => th.textContent.trim().includes('DT.VALIDADE')),
        qtd: headers.findIndex(th => th.textContent.trim().includes('QT ENTRADA')),
        // ADICIONADO: Encontra o índice da nova coluna.
        // ATENÇÃO: Verifique se o texto 'QT. CONF' corresponde exatamente ao cabeçalho na sua tabela.
        qtconf: headers.findIndex(th => th.textContent.trim().includes('QT CONF'))
    };

    // Validação para garantir que todas as colunas foram encontradas
    for (const key in indiceColunas) {
        if (indiceColunas[key] === -1) {
            alert(`Erro Crítico: A coluna "${key.toUpperCase()}" não foi encontrada no cabeçalho da tabela. Verifique o texto exato no TH.`);
            return;
        }
    }

    // 2. Iterar sobre as linhas da tabela
    linhas.forEach(linha => {
        if (linha.style.display !== 'none') {
            const celulas = linha.querySelectorAll('td');
            
            // Monta um objeto com os dados da linha, usando os índices encontrados
            const dadosLinha = {
                codprod: celulas[indiceColunas.codprod]?.textContent.trim(),
                descricao: celulas[indiceColunas.descricao]?.textContent.trim(),
                validade: celulas[indiceColunas.validade]?.textContent.trim(),
                qtd: celulas[indiceColunas.qtd]?.textContent.trim(),
                // ADICIONADO: Coleta o dado da nova coluna.
                qtconf: celulas[indiceColunas.qtconf]?.textContent.trim()
            };
            dadosParaPdf.push(dadosLinha);
        }
    });

    if (dadosParaPdf.length === 0) {
        alert("Não há dados visíveis para gerar o relatório.");
        return;
    }
    
    // 3. Enviar os dados para o PHP através do formulário oculto
    const inputOculto = document.getElementById('dados_visiveis_input');
    const formularioPdf = document.getElementById('pdf-form');

    inputOculto.value = JSON.stringify(dadosParaPdf);
    formularioPdf.submit();
}

gerarPdfBtn.addEventListener('click', gerarRelatorioPDF);

function limparFiltro(){
    document.getElementById('filial').value = 'todas';
    document.getElementById('numBonus').value = '';
    document.getElementById('data-ini').value = '';
    document.getElementById('data-fim').value = '';
    /* document.getElementById('data-ini_bonus').value = '';
    document.getElementById('data-fim_bonus').value = '';
    document.getElementById('fornecedor').value = ''; */
    document.getElementById('departamento').value = '';
    document.getElementById('produto').value = '';
    resultContainer.innerHTML = ''; // Limpa os resultados da tabela

    limparBtn.style.display = 'none';
    exportarBtn.style.display = 'none';
    document.getElementById('table-controls').style.display = 'none';

    document.getElementById('gerar-pdf-btn').style.display = 'none';
    limparBtn.style.display = 'none';
    exportarBtn.style.display = 'none';
}

// 🔹 Coleta os dados dos inputs
function coletarDados() {
    analiseDados.filial = document.getElementById('filial').value;
    analiseDados.bonus = document.getElementById('numBonus').value;
    analiseDados.data.inicial = document.getElementById('data-ini').value;
    analiseDados.data.final = document.getElementById('data-fim').value;
    /* analiseDados.dataBonus.inicial = document.getElementById('data-ini_bonus').value;
    analiseDados.dataBonus.final = document.getElementById('data-fim_bonus').value; 
    analiseDados.fornecedor = document.getElementById('fornecedor').value; */
    analiseDados.departamento = document.getElementById('departamento').value;
    analiseDados.produto = document.getElementById('produto').value;
}

// 🔹 Envia dados para o backend
async function enviarDados(payload) {
    try {
        const response = await fetch('./backend/buscarBonus.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        /* console.log(result); */
        /* console.log("Resposta do servidor:", result); */
        return result;
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
        alert('Erro na comunicação com o servidor.');
        return [];
    }
}

/**
 * Exporta uma tabela HTML para um arquivo .xlsx usando a biblioteca exceljs.
 *
 * @param {string} tabelaId O ID da tabela HTML a ser exportada.
 * @param {string} nomeArquivo O nome do arquivo .xlsx a ser gerado.
 */
async function exportarComExcelJS(tabelaId = 'resultTable', nomeArquivo = 'vencimentos.xlsx') {
    const tabela = document.getElementById(tabelaId);
    if (!tabela) {
        console.error(`Tabela com id "${tabelaId}" não encontrada.`);
        return;
    }

    // 1. Criar um novo Workbook e uma Worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Vencimentos');

    // ATUALIZADO: Define os índices das colunas de data (baseados em zero)
    // "DT DO BÔNUS" é a 7ª coluna, então índice 6
    // "DT VALIDADE" é a 8ª coluna, então índice 7
    const dateColumnIndices = [6, 7];

    // 2. Iterar sobre as linhas da tabela HTML para extrair os dados
    const linhas = tabela.rows;
    for (let i = 0; i < linhas.length; i++) {
        const linhaTabela = linhas[i];
        const celulas = Array.from(linhaTabela.cells).map((cell, colIndex) => {
            if (dateColumnIndices.includes(colIndex)) {
                // Tenta analisar a string da data em um objeto Date
                try {
                    // Assume que a data pode vir como "dd/mm/yyyy" ou "yyyy-mm-dd"
                    // Se a sua data estiver em "dd/mm/yyyy", você precisará convertê-la para "yyyy-mm-dd" para o construtor Date
                    const dateParts = cell.innerText.split('/');
                    let formattedDateString;
                    if (dateParts.length === 3) {
                        formattedDateString = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                    } else {
                        formattedDateString = cell.innerText; // Assume que já está em um formato que Date pode entender (e.g., YYYY-MM-DD)
                    }

                    const date = new Date(formattedDateString);
                    // Verifica se a data é válida antes de retorná-la como um objeto Date
                    return isNaN(date.getTime()) ? cell.innerText : date;
                } catch (e) {
                    console.warn(`Não foi possível analisar a data para a coluna ${colIndex}: ${cell.innerText}`, e);
                    return cell.innerText; // Retorna a string se a análise falhar
                }
            }
            return cell.innerText;
        });
        worksheet.addRow(celulas);
    }

    // ATUALIZADO: Aplicar largura de colunas.
    // Você tem 18 colunas agora, então a matriz 'larguras' deve ter 18 entradas.
    const larguras = [
        { wch: 10 }, // BÔNUS
        { wch: 10 }, // FILIAL
        { wch: 10 }, // DPTO
        { wch: 15 }, // COD PROD
        { wch: 45 }, // DESCRIÇÃO
        { wch: 15 }, // QT ENTRADA
        { wch: 15 }, // QT CONFERIDA
        { wch: 15 }, // DT DO BÔNUS (aumentei um pouco para caber a data)
        { wch: 15 }, // DT VALIDADE (aumentei um pouco para caber a data)
        { wch: 15 }, // D. RESTANTES
        { wch: 15 }, // FORNECEDOR
        { wch: 15 }, // COD COMPRADOR
        { wch: 40 }, // NOME COMPRADOR
        { wch: 10 }, // GIRO F1
        { wch: 10 }, // GIRO F2
        { wch: 10 }, // GIRO F3
        { wch: 10 }, // GIRO F4
        { wch: 10 }, // GIRO F5
        { wch: 10 }  // GIRO F7
    ];

    worksheet.columns.forEach((column, index) => {
        if (larguras[index]) {
            column.width = larguras[index].wch;
        }
    });
    
    // Exemplo de como você poderia estilizar o cabeçalho (a primeira linha)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { name: 'Calibri', size: 12, bold: true };
    headerRow.fill = {
        type: 'pattern',
        pattern:'solid',
        fgColor:{ argb:'FFD3D3D3' } // Cor cinza claro
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // ATUALIZADO: Define um formato de data padrão para as colunas de data
    // Agora as colunas são 7 (índice 6) e 8 (índice 7)
    worksheet.getColumn(7).numFmt = 'dd/mm/yyyy'; // 'Data do Bônus'
    worksheet.getColumn(8).numFmt = 'dd/mm/yyyy'; // 'Data Validade'


    // 4. Gerar o arquivo e iniciar o download no navegador
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function diasParaVencer(dataValidadeStr) {
    const hoje = new Date();
    const validade = new Date(dataValidadeStr);
    const diff = (validade - hoje) / (1000 * 60 * 60 * 24);
    return Math.ceil(diff);
}

function gerarCorProximidade(diasRestantes) {

    if(diasRestantes){
        return '#8B0000';
    }

    const maxDias = 30;
    const fator = Math.max(0, Math.min(1, 1 - (diasRestantes / maxDias)));

    const vermelho = 255;
    const verde = Math.floor(229 + (255 - 229) * (1 - fator));
    const azul = Math.floor(229 + (255 - 229) * (1 - fator));

    return `rgb(${vermelho}, ${verde}, ${azul})`;
}

// 🔹 Função principal para consultar
async function consultar(e) {
    e.preventDefault();

    coletarDados();

    // Validação básica
    if (!analiseDados.bonus && !analiseDados.data.inicial && !analiseDados.data.final && !analiseDados.dataBonus.final && !analiseDados.dataBonus.inicial) {
        alert('Por favor, insira os dados necessários');
        return;
    }

    mostrarLoading();
    const resultado = await enviarDados(analiseDados);
    esconderLoading();

    montarTabela(resultado, resultContainer);
    tornarColunasRedimensionaveis("resultTable");
}

// 🔹 Adiciona redimensionamento de colunas na tabela
function tornarColunasRedimensionaveis(tabelaId) {
    const table = document.getElementById(tabelaId);
    if (!table) return;

    const ths = table.querySelectorAll("th");
    ths.forEach(th => {
        const resizer = document.createElement("div");
        resizer.classList.add("resizer");
        th.appendChild(resizer);

        resizer.addEventListener("mousedown", (e) => {
            const startX = e.pageX;
            const startWidth = th.offsetWidth;

            function mousemove(e) {
                const novaLargura = startWidth + (e.pageX - startX);
                th.style.width = novaLargura + "px";
            }

            function mouseup() {
                document.removeEventListener("mousemove", mousemove);
                document.removeEventListener("mouseup", mouseup);
            }

            document.addEventListener("mousemove", mousemove);
            document.addEventListener("mouseup", mouseup);
        });
    });
}

// 🔹 Calcula dias restantes para vencimento
function diasParaVencer(dataValidadeStr) {
    const hoje = new Date();
    const validade = new Date(dataValidadeStr);
    const diff = (validade - hoje) / (1000 * 60 * 60 * 24);
    return Math.ceil(diff);
}

// 🔹 Mostra overlay de loading
function mostrarLoading() {
    document.getElementById('loadingOverlay')?.classList.remove('hidden');
}

// 🔹 Esconde overlay de loading
function esconderLoading() {
    document.getElementById('loadingOverlay')?.classList.add('hidden');
}

// 🔹 Monta a tabela com os dados retornados
function montarTabela(tabela, container) {
    if (!tabela || !tabela.length) {
        container.innerHTML = '<p class="text-muted">Nenhum resultado encontrado.</p>';
        return;
    }

    let linhas = '';
    for (let item of tabela) {
        const parsedDias = parseInt(item.diasrestantes, 10);
        const diasRestantes = !isNaN(parsedDias) ? parsedDias : '---';
        let classeLinha = '';

        if (diasRestantes <= 0 || diasRestantes === '---') {
            classeLinha = 'vencido';
        } else if (diasRestantes <= 30) {
            const faixa = Math.ceil(diasRestantes / 5) * 5;
            classeLinha = `proximo-vencimento-${faixa}`;
        }

        linhas += `
            <tr class="${classeLinha}" id="${item.id}">
                <td>${item.bn}</td>
                <td>${item.fl}</td>
                <td>${item.dp}</td>
                <td>${item.codprod}</td>
                <td>${item.desc}</td>
                <td>${item.quantent}</td>
                <td>${item.qtconf}</td>
                <td>${item.dtbonus}</td>
                <td>${item.dtvalidade}</td>
                <td>${diasRestantes}</td>
                <td>${item.codfornec}</td>
                <td>${item.codcomprador}</td>
                <td>${item.nomecomprador}</td>
                <td>${(item.media_g1.toFixed(2) ?? '---')}</td>
                <td>${(item.media_g2.toFixed(2) ?? '---')}</td>
                <td>${(item.media_g3.toFixed(2) ?? '---')}</td>
                <td>${(item.media_g4.toFixed(2) ?? '---')}</td>
                <td>${(item.media_g5.toFixed(2) ?? '---')}</td>
                <td>${(item.media_g7.toFixed(2) ?? '---')}</td>
            </tr>
        `;
    }

    container.innerHTML = `
        <div class="resizable-container">
            <div class="table-responsive mb-3 table__validade_container">
                <table class="table_validade" id="resultTable">
                    <thead>
                        <tr>
                            <th>BÔNUS</th>
                            <th>FILIAL</th>
                            <th scope="col"><abbr title="Departamento">DPTO</abbr></th>
                            <th scope="col"><abbr title="Código do produto">CODPROD</abbr></th>
                            <th>DESCRIÇÃO</th>
                            <th><abbr title="Quantidade de entrada">QT ENTRADA</abbr></th>
                            <th><abbr title="Quantidade conferida">QT CONF</abbr></th>
                            <th><abbr title="Data do bônus">DT DO BÔNUS</abbr></th>
                            <th scope="col"><abbr title="Data de validade">DT.VALIDADE</abbr></th>
                            <th scope="col"><abbr title="Dias para vencer">D.RESTANTES</abbr></th>
                            <th scope="col"><abbr title="Código do fornecedor">C.FORNEC</abbr></th>
                            <th scope="col"><abbr title="Código do comprador">C.COMPRADOR</abbr></th>
                            <th>NOME COMPRADOR</th>
                            <th scope="col"><abbr title="Giro mês filial 1">GIRO F1</abbr></th>
                            <th scope="col"><abbr title="Giro mês filial 2">GIRO F2</abbr></th>
                            <th scope="col"><abbr title="Giro mês filial 3">GIRO F3</abbr></th>
                            <th scope="col"><abbr title="Giro mês filial 4">GIRO F4</abbr></th>
                            <th scope="col"><abbr title="Giro mês filial 5">GIRO F5</abbr></th>
                            <th scope="col"><abbr title="Giro mês filial 7">GIRO F7</abbr></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${linhas}
                    </tbody>
                </table>
            </div>
            <div class="legenda">
                <p><strong>Legenda:</strong></p>
                <ul>
                    <li><span class="cor-swatch vencido"></span> Produto vencido</li>
                    <li><span class="cor-swatch proximo-vencimento-5"></span> Vence em até 5 dias</li>
                    <li><span class="cor-swatch proximo-vencimento-10"></span> Vence em até 10 dias</li>
                    <li><span class="cor-swatch proximo-vencimento-15"></span> Vence em até 15 dias</li>
                    <li><span class="cor-swatch proximo-vencimento-30"></span> Vence em até 30 dias</li>
                </ul>
            </div>
        </div>
    `;

    // Adiciona o botão de limpar
    limparBtn.style.display = 'inline-block';
    exportarBtn.style.display = 'inline-block';

    InteractiveTable.init('resultTable', 'table-controls');

    document.getElementById('gerar-pdf-btn').style.display = 'inline-block';
    limparBtn.style.display = 'inline-block';
    exportarBtn.style.display = 'inline-block';
}


// 🔹 Botão pesquisar
pesquisar.addEventListener('click', consultar);

limparBtn.addEventListener('click', limparFiltro);

exportarBtn.addEventListener('click', () => {
    exportarComExcelJS('resultTable', 'vencimentos.xlsx');
});