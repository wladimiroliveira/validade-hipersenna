const elementosConsulta = {
    filtro: document.getElementById('selectControl'),
    info: document.getElementById('infoContinaer'),
    result: document.getElementById('resultContainer'),
    botao: document.getElementById('botaoConsultar')
};

const elementosCsv = {
    container: document.getElementById('csvContainer'),
    botao: document.getElementById('exportar')
};


// Objeto base
const dados = {
    filial: '',
    paraVencer: '',
    produto: '',
    intervaloData: {
        dataIni: '',
        dataFim: ''
    },
    dataInsercao: {
        dataIni: '',
        dataFim: '',
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
        const response = await fetch('./backend/consultaValidade.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        console.log(result);

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