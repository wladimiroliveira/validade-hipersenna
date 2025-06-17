const formUser = document.querySelector('.form__validade_colab');
var nomeColab = document.getElementById('nome');
var matriculaColab = document.getElementById('matricula');

formUser.addEventListener('submit', async (e)=>{
    e.preventDefault();
    dados['user']['nome'] = nomeColab.value;
    dados['user']['matricula'] = matriculaColab.value;

    // Redireciona para outra página
    localStorage.setItem('dados', JSON.stringify(dados));
    window.location.href = "formProd.html";
})