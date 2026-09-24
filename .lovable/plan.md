# Corrigir locais de treino e a cobertura dos testes

## Correção

- Alinhar os valores enviados pelo formulário com os valores aceitos pelo gerador: `academia`, `casa_equipamentos`, `casa_sem_equipamentos` e `ar_livre`.
- Manter os textos visíveis e as traduções atuais; somente os valores internos serão corrigidos.
- Confirmar que todos os objetivos continuam aceitos em combinação com qualquer local de treino.

## Testes contra regressão

- Transformar o teste do formulário em casos parametrizados que submetam cada opção de local, em vez de testar apenas academia.
- Cobrir também todas as opções de objetivo exibidas no formulário e verificar o valor exato enviado ao gerador.
- Adicionar um contrato que compare as opções disponíveis no formulário com a validação do gerador, impedindo que os dois lados voltem a divergir.
- Manter os testes existentes de autenticação, cota, sucesso, salvamento e mensagens de erro.

## Validação

- Executar a suíte completa, cobertura, lint e formatação.
- Testar o fluxo real com pelo menos uma opção de casa e uma opção ao ar livre, confirmando que a solicitação deixa de ser rejeitada antes da geração.
- Publicar a função corrigida para que o ajuste funcione no aplicativo ao vivo.