// filial.js

// 1. Carregar os dados do localStorage. Se não houver nada, cria a estrutura padrão.
// Esta parte do seu código já estava ótima.
let dados = JSON.parse(localStorage.getItem('dados')) || {
    user: { nome: "", matricula: "", filial: "" },
    prod: { itens: [] }
};

// 2. Selecionar os elementos do HTML de forma mais clara.
const filialSelect = document.getElementById('filialSelect');
const proximoBtn = document.getElementById('filial-btn');

// 3. Adicionar o "ouvinte" de evento ao botão de "Próximo".
proximoBtn.addEventListener('click', (e) => {
    // Não é necessário prevenir o comportamento padrão (e.preventDefault()) para um botão simples,
    // a menos que ele esteja dentro de um <form> que você não queira submeter.

    // A. Obter o valor selecionado no <select>.
    const valorFilial = filialSelect.value;

    // B. Atualizar o objeto 'dados' diretamente.
    // Usamos parseInt() para garantir que o valor seja armazenado como um número,
    // como na sua estrutura original planejada. Se a filial puder não ser um número, remova o parseInt.
    dados.user.filial = parseInt(valorFilial, 10);

    // C. SALVAR O OBJETO ATUALIZADO DE VOLTA NO LOCALSTORAGE.
    // Esta é a etapa crucial. O objeto é convertido para uma string JSON para ser armazenado.
    localStorage.setItem('dados', JSON.stringify(dados));

    // Opcional: Você pode verificar no console do navegador se foi salvo corretamente.
    console.log('Dados salvos no localStorage:', dados);

    // D. Redirecionar o usuário para a próxima página.
    window.location.href = 'inserirValidade.php';
});