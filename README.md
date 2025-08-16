# Sistema de Vencimento
Este projeto trata-se do protótipo de um sistema de gerenciamento de vencimento, utilizado pelo supermercado HiperSenna.
## Arquitetura
É um sistema simples, que utiliza três camadas que definem suas funcionalidades.
1. **Camada Front-End:** Camada responsável por receber os inputs e interações do usuário, a partir deste inputs que os dados serão tratados pelas camadas posteriores. Esta é uma camada dinâmica que utiliza HTML para receber as interaçõe, e logo após, utiliza JavaScript para tratar estes inputs, e, posteriormente, enviar dados para a segunda camada.
2. **Camada Back-End:** Esta é uma camada simples, responsável por interagir com o lado **client-side** e o lado **server-side**. Primeiro ela recebe um request com dados JSON enviados pelo JavaScript, e então redireciona estes dados para o servidor, juntamente com um Token de verificação. Todo o Back-End é desenvolvido em PHP.
3. **Camada Servidor:** Por último e não menos importante, temos a 3ª camada, esta camada é responsável por fazer os tratamentos de dados, e se comunicar com o banco de dadso, ela recebe os dados do **Back-End** trata-os, e então envia um retorno, ela é completamente desenvolvida em PHP.
