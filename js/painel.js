const filtroControl = document.getElementById('selectControl');
const infoContainer = document.getElementById('infoContainer');
const resultContainer = document.getElementById('resultContainer');
const botaoConsultar = document.getElementById('botaoConsultar');
const dados = {
    'paraVencer': '',
    'intervaloData': {
        'dataIni': '',
        'dataFim': ''
    }
}

function receberDados(control, container){
    control = control.value;
    if(control == 'diasParaVencer'){
        container.innerHTML = `
        <div class="dias_container">
            <label for="dias"><strong>Quantidade de dias para vencer:</strong></label>
            <input type="number" class="form-control" name="dias" id="dias" required>
        </div>
        `;
    } else if (control == 'dataIntervalo') {
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
}

async function enviarDados(dados) {
    try {
        const response = await fetch('http://localhost/validade_hipersenna/backend/consultaValidade.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados)
        });

        const result = await response.json();
        console.log("Resposta:", result);
        return result;
    } catch (e) {
        console.error('Erro ao interpretar JSON:', e);
        alert('Erro inesperado na resposta do servidor.');
        return [];
    }
}

function montarTabelaDiasAVencer(tabela, container) {
    let linhas = '';
    for (let item of tabela) {
        linhas += `
            <tr>
                <th scope="row">${item.codprod}</th>
                <td>${item.descricao}</td>
                <td>${item.data_validade}</td>
                <td>${item.quantidade}</td>
                <td>${item.filial}</td>
            </tr>
        `;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-striped" id="resultTable">
                <thead>
                    <tr>
                        <th scope="col">Código</th>
                        <th scope="col">Descrição</th>
                        <th scope="col">Dt. Validade</th>
                        <th scope="col">Quantidade</th>
                        <th scope="col">Filial</th>
                    </tr>
                </thead>
                <tbody id="resultBody">
                    ${linhas}
                </tbody>
            </table>
        </div> 
    `;
}

async function consultar(control) {
    const tipoFiltro = control.value;
    if (tipoFiltro === 'diasParaVencer') {
        dados.paraVencer = document.getElementById('dias').value;
        const tabela = await enviarDados({ paraVencer: dados.paraVencer });
        montarTabelaDiasAVencer(tabela, resultContainer);
    } else if (tipoFiltro === 'dataIntervalo') {
        dados.intervaloData.dataIni = document.getElementById('dataIni').value;
        dados.intervaloData.dataFim = document.getElementById('dataFim').value;
        const tabela = await enviarDados({ intervaloData: dados.intervaloData });
        montarTabelaDiasAVencer(tabela, resultContainer);
    }
}

filtroControl.addEventListener('change', ()=>{
    receberDados(filtroControl, infoContainer);
})

botaoConsultar.addEventListener('click', ()=>{
    consultar(filtroControl);
})