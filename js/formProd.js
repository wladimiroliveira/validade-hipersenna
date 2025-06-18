// Estrutura inicial: array de objetos para produtos
let dados = JSON.parse(localStorage.getItem('dados')) || {
    user: { nome: "", matricula: "" },
    prod: { itens: [] }
};

const formProd = document.querySelector('.form__validade_prod');
const insertBtn = document.getElementById('prodInserir');
const inputCodprod = document.getElementById('codProd');
const inputDescricao = document.querySelector('.result_descricao');
const inputData = document.getElementById('data');
const inputQuant = document.getElementById('quantidade');
const prodTable = document.getElementById('prodTable');
const prodList = document.getElementById('produtosList');

// Função para inserir ou somar quantidade
function inserirOuSomarProduto(codprod, descricao, validade, quantidade) {
    const idx = dados.prod.itens.findIndex(
        item => item.codprod === codprod && item.validade === validade
    );
    if (idx !== -1) {
        // Se existe, soma a quantidade
        dados.prod.itens[idx].quantidade += quantidade;
    } else {
        // Se não existe, adiciona novo
        dados.prod.itens.push({
            codprod,
            descricao,
            validade,
            quantidade
        });
    }
}

// Renderiza a tabela com os itens do array
function renderTable() {
    prodList.innerHTML = "";
    dados.prod.itens.forEach((item, i) => {
        prodList.innerHTML += `
            <tr>
                <th scope="row">${i + 1}</th>
                <td>${item.codprod}</td>
                <td>${item.descricao}</td>
                <td>${item.validade}</td>
                <td>${item.quantidade}</td>
                <td>
                    <button class="btn btn-danger btn-remover" data-index="${i}">Remover</button>
                </td>
            </tr>
        `;
    });
}

// Desabilita o botão inicialmente
insertBtn.disabled = true;

// Habilita o botão apenas se o campo data estiver preenchido
inputData.addEventListener('input', () => {
    insertBtn.disabled = !inputData.value;
});

// Evento do botão inserir
insertBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const codprod = inputCodprod.value;
    const descricao = inputDescricao.innerHTML;
    const validade = inputData.value;
    const quantidade = parseInt(inputQuant.value, 10) || 0;
    if (!codprod || !validade || quantidade <= 0) return;
    inserirOuSomarProduto(codprod, descricao, validade, quantidade);
    renderTable();
    // Limpa os campos
    inputCodprod.value = '';
    inputData.value = '';
    inputQuant.value = '';
    inputDescricao.innerHTML = '';
    insertBtn.disabled = true;
});

// Remover item da tabela
prodList.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-remover')) {
        const idx = parseInt(e.target.getAttribute('data-index'));
        dados.prod.itens.splice(idx, 1);
        renderTable();
    }
});

// Inicializa a tabela ao carregar
renderTable();

// Envio do formulário
formProd.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const response = await fetch('http://localhost/validade_hipersenna/backend/dadosValidade.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados)
        });
        
        const result = await response.json();
        console.log("Resposta:", result);

        if (result.sucesso) {
            // Redireciona para outra página, por exemplo, sucesso.html
            window.location.href = 'success.html';
        } else {
            alert(result.mensagem || 'Erro ao enviar dados.');
        }

    } catch (e) {
        console.error('Erro ao interpretar JSON:', e);
        alert('Erro inesperado na resposta do servidor.');
    }
});