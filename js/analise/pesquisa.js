const pesquisar = document.getElementById('pesquisar');
const limparBtn = document.getElementById('limpar');
const resultContainer = document.getElementById('resultContainer');
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
};

function limparFiltro(){
    document.getElementById('filial').value = 'todas';
    document.getElementById('numBonus').value = '';
    document.getElementById('data-ini').value = '';
    document.getElementById('data-fim').value = '';
    document.getElementById('fornecedor').value = '';
    document.getElementById('secao').value = '';
    document.getElementById('produto').value = '';
    resultContainer.innerHTML = ''; // Limpa os resultados da tabela

    limparBtn.style.display = 'none';
}

// 🔹 Coleta os dados dos inputs
function coletarDados() {
    analiseDados.filial = document.getElementById('filial').value;
    analiseDados.bonus = document.getElementById('numBonus').value;
    analiseDados.data.inicial = document.getElementById('data-ini').value;
    analiseDados.data.final = document.getElementById('data-fim').value;
    analiseDados.fornecedor = document.getElementById('fornecedor').value;
    analiseDados.secao = document.getElementById('secao').value;
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
        /* console.log("Resposta do servidor:", result); */
        return result;
    } catch (error) {
        console.error('Erro ao enviar dados:', error);
        alert('Erro na comunicação com o servidor.');
        return [];
    }
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

// 🔹 Função principal para consultar
async function consultar(e) {
    e.preventDefault();

    coletarDados();

    // Validação básica
    if (!analiseDados.bonus && !analiseDados.data.inicial && !analiseDados.data.final) {
        alert('Por favor, insira os dados necessários');
        return;
    }

    mostrarLoading();
    const resultado = await enviarDados(analiseDados);
    esconderLoading();

    console.log(resultado);

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
        const diasRestantes = diasParaVencer(item.dtvalidade);
        let classeLinha = '';

        if (diasRestantes <= 0) {
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
                <td>${item.sec}</td>
                <td>${item.codprod}</td>
                <td>${item.desc}</td>
                <td>${item.quantnf}</td>
                <td>${item.quantent}</td>
                <td>${item.dtvalidade}</td>
                <td>${item.diasrestantes}</td>
                <td>${item.codfornec}</td>
                <td>${item.codcomprador}</td>
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
        <div class="resizable-container">
            <div class="table-responsive mb-3 table__validade_container">
                <table class="table_validade" id="resultTable">
                    <thead>
                        <tr>
                            <th>BÔNUS</th>
                            <th>FILIAL</th>
                            <th>DEPARTAMENTO</th>
                            <th>SEÇÃO</th>
                            <th>COD PRODUTO</th>
                            <th>DESCRIÇÃO</th>
                            <th>QT NF</th>
                            <th>QT ENTRADA</th>
                            <th>DATA VALIDADE</th>
                            <th>DIAS RESTANTES</th>
                            <th>COD FORNECEDOR</th>
                            <th>COD COMPRADOR</th>
                            <th>GIRO F1</th>
                            <th>GIRO F2</th>
                            <th>GIRO F3</th>
                            <th>GIRO F4</th>
                            <th>GIRO F5</th>
                            <th>GIRO F7</th>
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
}

// 🔹 Botão pesquisar
pesquisar.addEventListener('click', consultar);

limparBtn.addEventListener('click', limparFiltro);