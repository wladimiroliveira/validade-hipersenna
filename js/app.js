const formUser = document.querySelector('.form__validade_colab');
const dados = {
    'user': {
        'nome': document.getElementById('nome'),
        'matricula': document.getElementById('matricula')
    },
    'prod': {
        'codprod': [],
        'validade': []
    }
}

formUser.addEventListener('submit', async (e)=>{
    e.preventDefault();
    dados['user']['nome'] = dados['user']['nome'].value;
    dados['user']['matricula'] = dados['user']['matricula'].value;

    
})