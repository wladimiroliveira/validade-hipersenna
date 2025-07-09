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
                <td>${diasRestantes} dia(s)</td>
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
                            <th scope="col">CODPROD</th>
                            <th scope="col">DESCRIÇÃO</th>
                            <th scope="col">DEPARTAMENTO</th>
                            <th scope="col">QUANTIDADE</th>
                            <th scope="col">CODFORNEC</th>
                            <th scope="col">CODCOMPRADOR</th>
                            <th scope="col">NOME COMPRADOR</th>
                            <th scope="col">DATA DE INSERÇÃO</th>
                            <th scope="col">MATRÍCULA COLAB</th>
                            <th scope="col">NOME COLAB</th>
                            <th scope="col">DATA DE VALIDADE</th>
                            <th scope="col">DIAS RESTANTES</th>
                            <th scope="col">GIRO F1</th>
                            <th scope="col">GIRO F2</th>
                            <th scope="col">GIRO F3</th>
                            <th scope="col">GIRO F4</th>
                            <th scope="col">GIRO F5</th>
                            <th scope="col">GIRO F7</th>
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