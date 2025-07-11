const exportarBtn = document.getElementById('exportar');

// Opções de tratativas
const opcoesTratativa = [
    "---",
    "Colocar em promoção",
    "⁠Troca com Fornecedor",
    "⁠Transferência Interna",
    "⁠Bloqueio para Venda",
    "⁠Doação"
];

const opcoesStatus = [
    "---",
    "Em andamento",
    "Concluído"
];

/* Função para largura dinâmica na tabela */
function tornarColunasRedimensionaveis(tabelaId) {
    const table = document.getElementById(tabelaId);
    const ths = table.querySelectorAll("th");

    ths.forEach(th => {
        const resizer = document.createElement("div");
        resizer.classList.add("resizer");
        th.appendChild(resizer);

        resizer.addEventListener("mousedown", mousedown);

        function mousedown(e) {
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
        }
    });
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
    const dateColumnIndices = [8, 11];

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
        { wch: 10 }, // FILIAL
        { wch: 15 }, // CODPROD
        { wch: 45 }, // DESC
        { wch: 10 }, // DPTO
        { wch: 10 }, // QUANT
        { wch: 15 }, // CODFORNEC
        { wch: 15 }, // CODCONPRADOR
        { wch: 40 }, // NOME COMPRADOR
        { wch: 20 }, // DATA INSERÇÃO
        { wch: 20 }, // COD COLAB
        { wch: 40 }, // NOME COLAB
        { wch: 20 }, // DATA VALIDADE
        { wch: 10 }, // D. RESTANTES
        { wch: 10 }, // GIRO F1
        { wch: 10 }, // GIRO F2
        { wch: 10 }, // GIRO F3
        { wch: 10 }, // GIRO F4
        { wch: 10 }, // GIRO F5
        { wch: 10 },  // GIRO F7
        { wch: 30 }, // TRATATIVA
        { wch: 30 }  // STATUS
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

function mostrarLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function esconderLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

function gerarCorProximidade(diasRestantes) {
    const maxDias = 30;
    const fator = Math.max(0, Math.min(1, 1 - (diasRestantes / maxDias)));

    const vermelho = 255;
    const verde = Math.floor(229 + (255 - 229) * (1 - fator));
    const azul = Math.floor(229 + (255 - 229) * (1 - fator));

    return `rgb(${vermelho}, ${verde}, ${azul})`;
}

function montarTabelaDiasAVencer(tabela, container) {
    if (!tabela.length) {
        container.innerHTML = '<p class="text-muted">Nenhum resultado encontrado.</p>';
        return;
    }

    let linhas = '';
    for (let item of tabela) {
        const parsedDias = parseInt(item.dias_restantes);
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
                <td scope="row">${item.filial}</td>
                <td>${item.codprod}</td>
                <td>${item.desc}</td>
                <td>${item.dp}</td>
                <td>${item.quant}</td>
                <td>${item.codfornec}</td>
                <td>${item.codcomp}</td>
                <td>${item.nomecomprador}</td>
                <td>${item.data_insercao}</td>
                <td>${item.matricula_colaborador}</td>
                <td>${item.nome_colaborador}</td>
                <td>${item.data_validade}</td>
                <td>${diasRestantes}</td>
                <td>${item.g1}</td>
                <td>${item.g2}</td>
                <td>${item.g3}</td>
                <td>${item.g4}</td>
                <td>${item.g5}</td>
                <td>${item.g7}</td>
                <td class="tratativa-cell" data-valor="${item.idxtratativa}">${item.tratativa}</td>
                <td class="status-cell" data-valor="${item.idxstatus}">${item.status}</td>
            </tr>
        `;
    }

    container.innerHTML = `
        <div class="resizable-container">
            <div class="table-responsive mb-3 table__validade_container">
                <table class="table_validade" id="resultTable">
                    <thead>
                        <tr>
                            <th scope="col">FILIAL</th>
                            <th scope="col"><abbr title="Código do produto">CODPROD</abbr></th>
                            <th scope="col">DESCRIÇÃO</th>
                            <th scope="col"><abbr title="Departamento">DPTO</abbr></th>
                            <th scope="col"><abbr title="Quantidade">QUANT</abbr></th>
                            <th scope="col"><abbr title="Código do fornecedor">C.FORNEC</abbr></th>
                            <th scope="col"><abbr title="Código do comprador">C.COMPRADOR</abbr></th>
                            <th scope="col">NOME COMPRADOR</th>
                            <th scope="col"><abbr title="Data de inserção">DT.INSERÇÃO</abbr></th>
                            <th scope="col"><abbr title="Matrícula do colaborador">C.COLAB</abbr></th>
                            <th scope="col">NOME COLAB</th>
                            <th scope="col"><abbr title="Data de validade">DT.VALIDADE</abbr></th>
                            <th scope="col"><abbr title="Dias para vencer">D.RESTANTES</abbr></th>
                            <th scope="col"><abbr title="Giro mês filial 1">GIRO F1</abbr></th>
                            <th scope="col"><abbr title="Giro mês filial 2">GIRO F2</abbr></th>
                            <th scope="col"><abbr title="Giro mês filial 3">GIRO F3</abbr></th>
                            <th scope="col"><abbr title="Giro mês filial 4">GIRO F4</abbr></th>
                            <th scope="col"><abbr title="Giro mês filial 5">GIRO F5</abbr></th>
                            <th scope="col"><abbr title="Giro mês filial 7">GIRO F7</abbr></th>
                            <th scope="col">TRATATIVA</th>
                            <th scope="col">STATUS</th>
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

    // Adicione o evento de click para as células de tratativa
    container.querySelectorAll('.tratativa-cell').forEach(cell => {
        cell.addEventListener('click', function () {
            if (cell.querySelector('select')) return;

            const valorAtual = cell.getAttribute('data-valor');
            const select = document.createElement('select');

            opcoesTratativa.forEach((opcao, idx) => {
                const opt = document.createElement('option');
                opt.value = idx + 1;
                opt.textContent = opcao;
                if (String(opt.value) === valorAtual) opt.selected = true;
                select.appendChild(opt);
            });

            const textoOriginal = cell.textContent;
            cell.textContent = '';
            cell.appendChild(select);
            select.focus();

            select.addEventListener('change', async function () {
                const novoValor = select.value;
                const novoTexto = select.options[select.selectedIndex].text;
                const tr = cell.closest('tr');
                const id = tr.getAttribute('id');

                cell.textContent = novoTexto;
                cell.setAttribute('data-valor', novoValor);

                mostrarLoading(); // <- mostra loading

                try {
                    const response = await fetch('./backend/editarValidade.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: id,
                            coluna: 'tratativa',
                            valor: novoValor
                        })
                    });
                    const result = await response.json();
                    /* console.log(result); */
                } catch (e) {
                    console.error('Erro ao salvar tratativa:', e);
                    alert('Erro ao salvar alteração. Tente novamente.');
                } finally {
                    esconderLoading(); // <- esconde loading
                }
            });

            select.addEventListener('blur', function () {
                if (cell.contains(select)) {
                    const textoSelecionado = select.options[select.selectedIndex].text;
                    const valorSelecionado = select.value;
                    cell.textContent = textoSelecionado;
                    cell.setAttribute('data-valor', valorSelecionado);
                }
            });
        });
    });


    container.querySelectorAll('.status-cell').forEach(cell => {
        cell.addEventListener('click', function () {
            if (cell.querySelector('select')) return;

            const valorAtual = cell.getAttribute('data-valor');
            const select = document.createElement('select');

            opcoesStatus.forEach((opcao, idx) => {
                const opt = document.createElement('option');
                opt.value = idx + 1;
                opt.textContent = opcao;
                if (String(opt.value) === valorAtual) opt.selected = true;
                select.appendChild(opt);
            });

            const textoOriginal = cell.textContent;
            cell.textContent = '';
            cell.appendChild(select);
            select.focus();

            select.addEventListener('change', async function () {
                const novoValor = select.value;
                const novoTexto = select.options[select.selectedIndex].text;
                const tr = cell.closest('tr');
                const id = tr.getAttribute('id');

                cell.textContent = novoTexto;
                cell.setAttribute('data-valor', novoValor);

                mostrarLoading(); // <- mostra loading

                try {
                    const response = await fetch('./backend/editarValidade.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: id,
                            coluna: 'status',
                            valor: novoValor
                        })
                    });
                    const result = await response.json();
                    /* console.log(result); */
                } catch (e) {
                    console.error('Erro ao salvar status:', e);
                    alert('Erro ao salvar alteração. Tente novamente.');
                } finally {
                    esconderLoading(); // <- esconde loading
                }
            });

            select.addEventListener('blur', function () {
                if (cell.contains(select)) {
                    const textoSelecionado = select.options[select.selectedIndex].text;
                    const valorSelecionado = select.value;
                    cell.textContent = textoSelecionado;
                    cell.setAttribute('data-valor', valorSelecionado);
                }
            });
        });
    });
}

// Ação de consulta com base no filtro
async function consultar(control) {
    const tipoFiltro = control.value;
    let payload = {};

    if (tipoFiltro === 'diasParaVencer') {
        const filial = document.getElementById('filial')?.value;
        const dias = document.getElementById('dias')?.value;
        if (!dias || isNaN(dias)) {
            alert("Por favor, informe a quantidade de dias.");
            return;
        }

        payload = { 
            filial: filial,
            paraVencer: dias 
        };

    } else if (tipoFiltro === 'dataIntervalo') {
        const filial = document.getElementById('filial')?.value;
        const dataIni = document.getElementById('dataInicio')?.value;
        const dataFim = document.getElementById('dataFim')?.value;

        if (!dataIni || !dataFim) {
            alert("Por favor, preencha as duas datas.");
            return;
        }

        payload = {
            filial: filial,
            intervaloData: {
                dataIni,
                dataFim
            }
        };
    } else {
        alert("Selecione um filtro válido.");
        return;
    }

    const tabela = await enviarDados(payload);
    montarTabelaDiasAVencer(tabela, resultContainer);
    tornarColunasRedimensionaveis("resultTable");

    if (tabela.length > 0 && elementosCsv['botao']) {
        elementosCsv['botao'].classList.add('ativo');
    }

    InteractiveTable.init('resultTable', 'table-controls');
}

// Eventos
elementosConsulta['filtro'].addEventListener('change', () => {
    receberDados(elementosConsulta['filtro'], infoContainer);
});

elementosConsulta['botao'].addEventListener('click', () => {
    consultar(elementosConsulta['filtro']);
});

exportarBtn.addEventListener('click', () => {
    exportarComExcelJS('resultTable', 'vencimentos.xlsx');
});