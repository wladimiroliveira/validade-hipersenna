const elementosConsulta = {
    filtro: document.getElementById('selectControl'),
    info: document.getElementById('infoContinaer'),
    result: document.getElementById('resultContainer'),
    botao: document.getElementById('botaoConsultar')
};

const elementosCsv = {
    container: document.getElementById('csvContainer'),
    botao: document.getElementById('botaoExportarCSV')
};


// Objeto base
const dados = {
    filial: '',
    paraVencer: '',
    intervaloData: {
        dataIni: '',
        dataFim: ''
    }
};

// Renderiza os inputs conforme o filtro
function receberDados(control, container) {
    const tipo = control.value;

    if (tipo === 'diasParaVencer') {
        container.innerHTML = `
            <div class="dias_container">
                <label for="dias"><strong>Quantidade de dias para vencer:</strong></label>
                <input type="number" class="form-control" name="dias" id="dias" required>
            </div>
        `;
    } else if (tipo === 'dataIntervalo') {
        container.innerHTML = `
            <div class="dataInicio_container">
                <label for="dataInicio"><strong>Data Inicial:</strong></label>
                <input type="date" class="form-control" id="dataInicio" name="dataInicio">
            </div>
            <div class="dataFim_container">
                <label for="dataFim"><strong>Data Final:</strong></label>
                <input type="date" class="form-control" id="dataFim" name="dataFim">
            </div>
        `;
    }

    // Limpa os resultados ao trocar o filtro
    resultContainer.innerHTML = '';
    elementosCsv['botao'].classList.remove('ativo')

}

// Envia os dados para o backend PHP
async function enviarDados(payload) {
    try {
        const response = await fetch('../backend/consultaValidade.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        // Garante que seja um array
        if (!Array.isArray(result)) {
            console.error('Resposta inválida:', result);
            alert('Erro na resposta da API.');
            return [];
        }
        return result;

    } catch (e) {
        console.error('Erro ao interpretar JSON:', e);
        alert('Erro inesperado na resposta do servidor.');
        return [];
    }
}

function diasParaVencer(dataValidadeStr) {
    const hoje = new Date();
    const validade = new Date(dataValidadeStr);
    const diff = (validade - hoje) / (1000 * 60 * 60 * 24);
    return Math.ceil(diff);
}

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
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Vencimentos');
    XLSX.writeFile(wb, nomeArquivo);
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
                <td>${item.g1}</td>
                <td>${item.g2}</td>
                <td>${item.g3}</td>
                <td>${item.g4}</td>
                <td>${item.g5}</td>
                <td>${item.g7}</td>
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
                        <th scope="col">GIRO F1</th>
                        <th scope="col">GIRO F2</th>
                        <th scope="col">GIRO F3</th>
                        <th scope="col">GIRO F4</th>
                        <th scope="col">GIRO F5</th>
                        <th scope="col">GIRO F7</th>
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