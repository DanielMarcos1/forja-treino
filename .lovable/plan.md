# Corrigir carregamento infinito das demonstrações

## Objetivo
Garantir que trocar de exercício sempre feche a demonstração anterior e carregue a nova, sem deixar o usuário preso em uma animação infinita.

## Alterações
- Manter apenas uma demonstração ativa por dia, identificada pelo exercício selecionado.
- Reiniciar completamente a busca e a imagem sempre que o exercício ativo mudar.
- Cancelar os efeitos da demonstração anterior para que respostas atrasadas não alterem o novo painel.
- Pré-carregar a animação antes de exibi-la e adicionar um limite de espera; se a biblioteca não responder, mostrar a mensagem de indisponibilidade e o link alternativo em vez do carregamento infinito.
- Usar uma chave estável baseada no exercício, evitando reaproveitamento incorreto de estado ao alternar rapidamente.

## Validação
- Abrir o primeiro exercício e, antes e depois do carregamento, alternar para o segundo.
- Alternar rapidamente entre três demonstrações e confirmar que apenas a última permanece aberta.
- Simular animação indisponível e confirmar que o carregamento termina com a alternativa disponível.
- Repetir em celular e computador, tanto em treino recém-gerado quanto em treino salvo.

## Detalhes técnicos
- O estado visual será associado à identidade da demonstração ativa, não apenas ao índice renderizado.
- A busca e o pré-carregamento usarão um identificador de execução e limpeza no efeito para ignorar resultados antigos.
- Um temporizador encerrará requisições de imagem que ficarem pendentes além do limite definido.
