document.addEventListener('DOMContentLoaded', function () {
    const inputCodepto = document.getElementById('departamento');
    const campoDescricao = document.querySelector('.result_descricao-departamento');

    let debounceTimer = null;
    let ultimoCodigoBuscado = '';

    inputCodepto.addEventListener('input', function () {
        const codepto = inputCodepto.value.trim();

        clearTimeout(debounceTimer);

        if (codepto.length === 0) {
            campoDescricao.textContent = '';
            return;
        }

        // Espera 400ms após o usuário parar de digitar
        debounceTimer = setTimeout(() => {
            ultimoCodigoBuscado = codepto; // Armazena o código que está sendo buscado
            fetch(`https://hipersenna.com.br/dev_assets/api/validade/buscar_departamento.php?codepto=${codepto}`)
                .then(response => response.json())
                .then(data => {
                    // Garante que o valor exibido corresponde ao último código digitado
                    if (inputCodepto.value.trim() === ultimoCodigoBuscado) {
                        if (data.sucesso) {
                            campoDescricao.textContent = data.descricao;
                        } else {
                            campoDescricao.textContent = 'Produto não encontrado';
                        }
                    }
                })
                .catch(error => {
                    console.error('Erro ao buscar descrição:', error);
                    campoDescricao.textContent = 'Erro na comunicação com o servidor';
                });
        }, 300); // Atraso de 400ms
    });
});
