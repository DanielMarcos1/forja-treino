# Corrigir o diagnóstico da cota e os treinos sem equipamentos

## Diagnóstico confirmado

- A tentativa concluída em **24/09/2026 às 19:46:21 UTC** foi a terceira geração mensal da conta correspondente; ela foi salva às 19:46:22 UTC.
- As duas tentativas seguintes não criaram registros de geração nem treinos salvos, comportamento compatível com o bloqueio da cota após a terceira geração.
- A tela não identifica esse bloqueio corretamente: a resposta da função chega como erro HTTP, mas o código procura `quota_exceeded` no lugar errado e acaba mostrando uma mensagem genérica.
- `casa_sem_equipamentos` e `ar_livre` são aceitos pela validação atual. O único treino concluído agora contém exercícios com halteres, mas a escolha enviada pelo formulário não é armazenada; portanto, não é possível afirmar pelos dados atuais se esse treino foi solicitado como “sem equipamentos”.

## Correções

- Ler o corpo real das respostas de erro da geração e distinguir claramente:
  - limite mensal de três treinos;
  - excesso temporário de solicitações;
  - créditos indisponíveis;
  - falha inesperada.
- Garantir que a terceira geração concluída seja exibida normalmente e somente a quarta tentativa em diante seja bloqueada.
- Reforçar as instruções da IA por local:
  - **casa sem equipamentos:** somente peso corporal e objetos comuns explicitamente permitidos, sem halteres, barras ou máquinas;
  - **ar livre:** exercícios praticáveis ao ar livre, sem presumir halteres ou aparelhos de academia;
  - **casa com equipamentos:** permitir equipamentos domésticos.
- Registrar, junto de cada geração futura, o local e o objetivo solicitados, sem dados pessoais ou texto de restrições, para permitir diagnósticos precisos.

## Testes

- Simular a resposta HTTP real de cota e verificar a mensagem específica apresentada na tela.
- Cobrir o limite: três sucessos contam; falhas e bloqueios não contam como novas gerações.
- Testar as regras de equipamento para academia, casa com equipamentos, casa sem equipamentos e ar livre.
- Manter o contrato que compara todas as opções do formulário com os valores aceitos pela geração.
- Executar a suíte completa, cobertura, lint e formatação; depois validar o fluxo autenticado sem gastar gerações reais desnecessárias.

## Resultado esperado

- O usuário verá que atingiu o limite mensal, em vez de um erro genérico.
- Pedidos sem equipamentos ou ao ar livre terão instruções inequívocas e não deverão incluir halteres indevidamente.
- Novas ocorrências poderão ser diagnosticadas pelo local e objetivo realmente enviados.
