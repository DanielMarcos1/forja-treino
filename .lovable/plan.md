# Suíte completa de testes da Forja

## Objetivo

Adicionar testes unitários e funcionais automatizados para todas as funcionalidades próprias da Forja, sem alterar o comportamento atual do aplicativo. Componentes genéricos de terceiros, arquivos gerados e estilos puramente visuais ficam fora da cobertura.

## 1. Preparar a infraestrutura de testes

- Instalar e configurar Vitest, ambiente DOM, React Testing Library, `user-event` e relatório de cobertura.
- Criar configuração global para limpar mocks, simular navegador e carregar os matchers de acessibilidade/DOM.
- Adicionar comandos para executar testes uma vez, em modo de observação e com cobertura.
- Definir cobertura sobre código próprio, excluindo árvore de rotas gerada, integrações autogeradas, arquivos de tipos e componentes-base de terceiros.

## 2. Testar regras e utilitários isolados

- Idiomas: validação de locale, detecção pelo navegador, fallback para português e parâmetro de rota.
- SEO: URLs canônicas por idioma, metadados Open Graph/Twitter, alternates e locale social.
- Exercícios: URL de busca externa, construção da URL do GIF, normalização multilíngue e escolha do melhor exercício, incluindo ausência de correspondência.
- Utilidades e páginas de erro: classes combinadas, captura/consumo de erros e HTML de recuperação.
- Sitemap: conteúdo XML, URLs públicas, idiomas, cabeçalhos e páginas indexáveis.

## 3. Testar autenticação e navegação

- Hook de autenticação: sessão inicial, login, logout, carregamento e remoção da inscrição.
- Cabeçalho: “Começar” para visitantes e “Meus treinos” para usuários autenticados, inclusive no mobile.
- Login Google: início do login, estado de espera, erros, retorno autenticado e redirecionamento localizado.
- Proteção das páginas de geração, lista e detalhe: visitante vai para login; usuário autenticado acessa o conteúdo.
- Seletor de idioma: abrir/fechar, Escape, clique externo, persistência e preservação do caminho ao trocar idioma.

## 4. Testar geração e apresentação do treino

- Formulário em quatro etapas: campos obrigatórios, limites, avanço/retorno, seleções e foco múltiplo.
- Envio correto dos dados convertidos e do idioma para o gerador.
- Estados de geração: sucesso, salvamento automático, resposta inválida, limite mensal, excesso de requisições, créditos e falha inesperada.
- Resultado: troca de dias, reinício, retorno à lista, cópia formatada e impressão.
- Demonstrações: busca, pré-carregamento, sucesso, falha, tempo limite, cancelamento ao fechar e somente uma demonstração aberta por vez.

## 5. Testar a área “Meus treinos”

- Carregamento ordenado, estado vazio e erro de leitura.
- Abertura do treino correto pelo identificador.
- Renomear por botão/Enter, cancelar por botão/Escape, impedir título vazio e tratar erro.
- Exclusão confirmada, cancelada e com erro.
- Detalhe: carregamento do conteúdo salvo, treino inexistente, falha e retorno à lista.

## 6. Tornar e testar o gerador do servidor

- Separar validação, sanitização, criação dos prompts e processamento da resposta em funções puras testáveis, mantendo o endpoint atual.
- Cobrir valores permitidos, rejeições, limites numéricos, textos de restrições, focos e fallback de idioma.
- Testar o fluxo do endpoint com dependências simuladas: CORS, ausência/invalidade de autenticação, consulta de cota, limite de três treinos, ausência de chave, payload inválido, respostas 402/429/500 da IA, resposta malformada, sucesso, registro da geração, salvamento automático e cálculo da cota restante.
- Verificar que falhas de registro ou salvamento não ocultam um treino já gerado, conforme o comportamento existente.

## 7. Validação final

- Executar toda a suíte e o relatório de cobertura.
- Corrigir apenas regressões reveladas pelos testes, sem ampliar funcionalidades.
- Executar lint e confirmar o build atual sem erros.
- Validar os principais fluxos funcionais em desktop e mobile: login, geração, demonstração, salvamento e gerenciamento de treinos.

## Critérios de conclusão

- Cada funcionalidade própria listada acima terá ao menos um caminho de sucesso e seus erros relevantes cobertos.
- A suíte será determinística: IA, autenticação, banco, clipboard, impressão, imagens e tempo serão simulados nos testes.
- O comando de testes terminará sem falhas e será adequado para uso local e integração contínua.
- A cobertura mínima será aplicada ao código próprio testável, com meta de 85% para linhas, funções e declarações e 80% para ramificações.
