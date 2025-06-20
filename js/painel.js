const filtroControl = document.getElementById('selectControl');
const infoContainer = document.getElementById('infoContainer');
const resultContainer = document.getElementById('resultContainer');
const botaoConsultar = document.getElementById('botaoConsultar');

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
}

// Envia os dados para o backend PHP
async function enviarDados(payload) {
    try {
        const response = await fetch('http://localhost/validade_hipersenna/backend/consultaValidade.php', {
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
        console.log(payload)
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
        const diasRestantes = diasParaVencer(item.data_validade);
        let classeLinha = '';

        if (diasRestantes < 0) {
            classeLinha = 'vencido';
        } else if (diasRestantes <= 30) {
            // Agrupa em faixas de 5 dias: 0–5, 6–10, etc.
            const faixa = Math.ceil(diasRestantes / 5) * 5;
            classeLinha = `proximo-vencimento-${faixa}`;
        }

        linhas += `
            <tr class="${classeLinha}">
                <th scope="row">${item.codprod}</th>
                <td>${item.descricao}</td>
                <td>${item.data_validade}</td>
                <td>${item.quantidade}</td>
                <td>${item.filial}</td>
            </tr>
        `;
    }

    container.innerHTML = `
        <div class="table__validade_container">
            <table class="table_validade" id="resultTable">
                <thead>
                    <tr>
                        <th scope="col">Código</th>
                        <th scope="col">Descrição</th>
                        <th scope="col">Dt. Validade</th>
                        <th scope="col">Quantidade</th>
                        <th scope="col">Filial</th>
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
}

// Eventos
filtroControl.addEventListener('change', () => {
    receberDados(filtroControl, infoContainer);
});

botaoConsultar.addEventListener('click', () => {
    consultar(filtroControl);
});
