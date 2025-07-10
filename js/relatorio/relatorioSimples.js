function exportarTabela(tabelaId = 'resultTable', nomeArquivo = 'vencimentos.xlsx') {
    const tabela = document.getElementById(tabelaId);
    if (!tabela) return;

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(tabela);

    // (opcional) aplica largura de colunas
    ws['!cols'] = [
        { wch: 10 },
        { wch: 40 },
        { wch: 15 },
        { wch: 12 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Vencimentos');
    XLSX.writeFile(wb, nomeArquivo);
}

function diasParaVencer(dataValidadeStr) {
    const hoje = new Date();
    const validade = new Date(dataValidadeStr);
    const diff = (validade - hoje) / (1000 * 60 * 60 * 24);
    return Math.ceil(diff);
}

function montarTabelaDiasAVencer(tabela, container) {
    if (!tabela.length) {
        container.innerHTML = '<p class="text-muted">Nenhum resultado encontrado.</p>';
        return;
    }

    let linhas = '';
    for (let item of tabela) {
        const diasRestantes = diasParaVencer(item.data_validade);
        let classeLinha = '';

        if (diasRestantes <= 0) {
            classeLinha = 'vencido';
        } else if (diasRestantes <= 30) {
            const faixa = Math.ceil(diasRestantes / 5) * 5;
            classeLinha = `proximo-vencimento-${faixa}`;
        }

        linhas += `
            <tr class="${classeLinha}">
                <td scope="row">${item.filial}</td>
                <td>${item.codprod}</td>
                <td>${item.desc}</td>
                <td>${item.dp}</td>
                <td>${item.quant}</td>
                <td>${item.codfornec}</td>
                <td>${item.codcomp}</td>
                <td>${item.data_validade}</td>
                <td>${item.dias_restantes} dia(s)</td>
            </tr>
        `;
    }

    container.innerHTML = `
        <div class="table-responsive mb-3 table__validade_container">
            <table class="table_validade" id="resultTable">
                <thead>
                    <tr>
                        <th scope="col">FILIAL</th>
                        <th scope="col">CODPROD</th>
                        <th scope="col">DESCRIÇÃO</th>
                        <th scope="col">DEPARTAMENTO</th>
                        <th scope="col">QUANTIDADE</th>
                        <th scope="col">CODFORNEC</th>
                        <th scope="col">CODCOMPRADOR</th>
                        <th scope="col">DATA DE VALIDADE</th>
                        <th scope="col">DIAS RESTANTES</th>
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
    `;
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

    if (tabela.length > 0 && elementosCsv['botao']) {
        elementosCsv['botao'].classList.add('ativo');
    }
}

// Eventos
elementosConsulta['filtro'].addEventListener('change', () => {
    receberDados(elementosConsulta['filtro'], infoContainer);
});

elementosConsulta['botao'].addEventListener('click', () => {
    consultar(elementosConsulta['filtro']);
});

elementosCsv['botao'].addEventListener('click', () => {
    exportarTabela();
});