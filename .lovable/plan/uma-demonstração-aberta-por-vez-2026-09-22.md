# Uma demonstração aberta por vez

## Objetivo
Garantir que, ao abrir a demonstração de outro exercício, a anterior feche automaticamente e a nova carregue normalmente.

## Alterações
- Controlar no cartão do dia qual exercício está com a demonstração aberta.
- Transformar cada demonstração em um painel controlado pelo cartão pai, em vez de cada exercício manter um estado isolado.
- Ao clicar em outro exercício, fechar o painel anterior e abrir imediatamente o novo.
- Ao clicar novamente no exercício já aberto, fechar sua demonstração.
- Reiniciar os estados de carregamento e erro sempre que uma nova demonstração for aberta, evitando animação de carregamento infinita.
- Manter o fallback atual para o YouTube quando não houver animação correspondente.

## Validação
- Abrir a demonstração do primeiro exercício e confirmar o carregamento.
- Abrir a demonstração de outro exercício e confirmar que a anterior fecha.
- Alternar rapidamente entre vários exercícios e verificar que apenas um painel permanece aberto.
- Confirmar o comportamento em celular e computador, inclusive para treinos salvos.

## Detalhes técnicos
- O identificador do exercício aberto ficará no componente que renderiza a lista do dia.
- `ExerciseDemo` receberá `open` e uma função de alternância, preservando a busca lazy da biblioteca.
- A troca de exercício invalidará estados visuais antigos para que callbacks de imagens anteriores não afetem a demonstração atual.
