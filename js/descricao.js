document.addEventListener('DOMContentLoaded', function () {
    const inputCodProd = document.getElementById('codProd');
    const campoDescricao = document.querySelector('.result_descricao');

    let debounceTimer = null;
    let ultimoCodigoBuscado = '';

    inputCodProd.addEventListener('input', function () {
        const codprod = inputCodProd.value.trim();

        clearTimeout(debounceTimer);

        if (codprod.length === 0) {
            campoDescricao.textContent = '';
            return;
        }

        // Espera 400ms após o usuário parar de digitar
        debounceTimer = setTimeout(() => {
            ultimoCodigoBuscado = codprod; // Armazena o código que está sendo buscado

            fetch(`https://hipersenna.com.br/dev_assets/api/validade/buscar_descricao.php?codprod=${codprod}`)
                .then(response => response.json())
                .then(data => {
                    // Garante que o valor exibido corresponde ao último código digitado
                    if (inputCodProd.value.trim() === ultimoCodigoBuscado) {
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
