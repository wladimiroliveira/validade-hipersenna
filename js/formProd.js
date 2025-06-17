// No início do formProd.js
let dados = JSON.parse(localStorage.getItem('dados')) || {
    user: { nome: "", matricula: "" },
    prod: { codprod: [] }
};
const formProd = document.querySelector('.form__validade_prod');
const insertBtn = document.getElementById('prodInserir');
const inputCodprod = document.getElementById('codProd');
const inputData = document.getElementById('data');
const prodTable = document.getElementById('prodTable');
const prodList = document.getElementById('produtosList');
let indice = 1

function inserirDados(obj, key, skey, input){
    obj[key][skey].push(input.value);
}

function renderTable() {
    prodList.innerHTML = "";
    for (let i = 0; i < dados['prod']['codprod'].length; i++) {
        prodList.innerHTML += `
            <tr>
                <th scope="row">${i + 1}</th>
                <td>${dados['prod']['codprod'][i]}</td>
                <td>Descrição</td>
                <td>${dados['prod']['validade'] ? dados['prod']['validade'][i] : ''}</td>
                <td>
                    <button class="btn btn-danger btn-remover" data-index="${i}">Remover</button>
                </td>
            </tr>
        `;
    }
}

// Desabilita o botão inicialmente
insertBtn.disabled = true;

// Habilita o botão apenas se o campo data estiver preenchido
inputData.addEventListener('input', () => {
    insertBtn.disabled = !inputData.value;
});

insertBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    inserirDados(dados, 'prod', 'codprod', inputCodprod);
    inserirDados(dados, 'prod', 'validade', inputData);
    renderTable();
    indice++;
})

prodList.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-remover')) {
        const idx = parseInt(e.target.getAttribute('data-index'));
        dados['prod']['codprod'].splice(idx, 1);
        if (dados['prod']['validade']) {
            dados['prod']['validade'].splice(idx, 1);
        }
        renderTable();
        indice--;
    }
});

renderTable();

formProd.addEventListener('submit', async (e)=>{
    e.preventDefault();

    try {
        const response = await fetch('http://localhost/validade_hipersenna/backend/dadosValidade.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados)
        });

        const text = await response.text(); // ✅ Agora `response` existe
        console.log("Resposta bruta:", text);

    } catch (e) {
        console.error('Erro ao interpretar JSON:', e);
        alert('Erro inesperado na resposta do servidor.');
    }
})