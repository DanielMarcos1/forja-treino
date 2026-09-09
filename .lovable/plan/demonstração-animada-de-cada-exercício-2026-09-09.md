# Demonstração animada de cada exercício

Trocar o link de busca no YouTube por uma animação do exercício (figura em fundo branco/cinza executando o movimento), exibida dentro do próprio app.

## Biblioteca escolhida

**BodyIQDB — Workout Exercise Animation Dataset** (1500 exercícios, GIF de 360px cada, JSON com músculo, equipamento e instruções, servido por CDN gratuito, sem chave de API).

Alternativa de reserva caso algum GIF falhe: ExerciseGymGifsDB (1300+ GIFs, também via jsDelivr, com nomes em EN/ES).

Motivo: são as duas únicas bases gratuitas, sem API key e sem limite de requisições, com exatamente o estilo de animação pedido. As opções pagas (ExerciseDB/RapidAPI) exigiriam chave e cobrança por uso.

## O desafio principal: casar os nomes

Os treinos são gerados pela IA em 4 idiomas, com nomes livres ("Supino reto com barra", "Agachamento búlgaro"). A biblioteca tem nomes em inglês. Solução em duas camadas:

1. **A IA passa a devolver também o nome canônico em inglês** de cada exercício (campo novo `nomeEn`), além do nome traduzido que o usuário vê.
2. **Casamento local** desse nome contra um índice do dataset embutido no projeto: normalização (minúsculas, sem acento), correspondência exata, depois por palavras-chave (movimento + equipamento), com pontuação de similaridade e um limiar mínimo.

## Comportamento na interface

- Cada exercício ganha um botão "Ver demonstração" que abre a animação **dentro do card**, com o nome do exercício e os passos da instrução (quando disponíveis).
- Enquanto o GIF carrega, um esqueleto de carregamento.
- Se nenhum exercício da biblioteca corresponder, o botão continua abrindo a busca no YouTube como hoje — nada fica sem demonstração.
- Funciona igual no `/gerar` e nos treinos salvos em "Meus treinos".
- Os GIFs não entram na impressão/PDF.

## Detalhes técnicos

**Criados**
- `src/lib/exerciseLibrary/index.json` — índice enxuto do dataset (id, nome, slug, músculo, equipamento) baixado do BodyIQDB e commitado no projeto, para o casamento acontecer offline e instantâneo.
- `src/lib/exerciseLibrary/match.ts` — normalização + pontuação de similaridade + `findExerciseGif(nomeEn, nome)`.
- `src/components/ExerciseDemo.tsx` — painel inline com o GIF (via CDN), título, instruções e botão de fechar; fallback para o link do YouTube.

**Editados**
- `supabase/functions/generate-workout/index.ts` — adicionar `nomeEn` ao schema da tool call e à instrução do prompt (obrigatório, nome padrão em inglês do exercício).
- `src/components/WorkoutResult.tsx` — tipo `Exercicio` ganha `nomeEn?`; o link atual de YouTube vira o novo `ExerciseDemo`.
- `src/lib/exerciseVideo.ts` — mantido apenas como fallback.
- `src/i18n/locales/{pt,en,es,fr}.json` — chaves `gerar.demo_loading`, `gerar.demo_not_found`, `gerar.demo_instructions`.
- `src/styles.css` — esconder o painel de demonstração na impressão.

**Compatibilidade**: treinos já salvos não têm `nomeEn`; nesses casos o casamento usa só o nome traduzido e, se falhar, cai no YouTube.

## Fora do escopo
- Vídeos reais / embed do YouTube.
- Substituir a IA por uma lista fixa de exercícios da biblioteca.
