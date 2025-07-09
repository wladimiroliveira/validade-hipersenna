const pesquisar = document.getElementById('pesquisar');
const analiseDados = {
    filial: '',
    bonus: '',
    fornecedor: '',
    secao: '',
    produto: '',
    data: {
        inicial: '',
        final: ''
    }
}

pesquisar.addEventListener('click', async (e) => {
    e.preventDefault();
    
    analiseDados.filial = document.getElementById('filial').value;
    analiseDados.bonus = document.getElementById('numBonus').value;
    analiseDados.data.inicial = document.getElementById('data-ini').value;
    analiseDados.data.final = document.getElementById('data-fim').value;
    analiseDados.fornecedor = document.getElementById('fornecedor').value;
    analiseDados.secao = document.getElementById('secao').value;
    analiseDados.produto = document.getElementById('produto').value;

    if(!analiseDados['bonus'] && !analiseDados['data']['inicial'] && !analiseDados['data']['final']) {
        alert('Por favor, insira os dados necessários');
    }

    try {
        const response = await fetch('http://localhost/vencimento/backend/buscarBonus.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(analiseDados)
        });

        const result = await response.text();
        console.log("Resposta: ", result);
        return result;
    } catch (e) {
        console.error('Erro ao interpretar JSON:', e);
        alert('Erro inseperado na resposta do servidor.')
        return [];
    }
});