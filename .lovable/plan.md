## Visão geral

Um app web onde a pessoa preenche um formulário com seus dados e objetivos, e uma IA (via Lovable AI Gateway) gera um plano de treino personalizado, exibido de forma bonita e exportável.

A identidade visual seguirá a referência enviada: roxo lavanda (#A6A8F0), laranja vibrante (#FFAB0D), navy profundo (#091E21) e creme (#FFF6E9), com cantos arredondados generosos, formas geométricas (losangos), e tipografia bold (Gilroy/Inter SemiBold para títulos).

## Páginas (rotas)

```
/                  Landing — hero, como funciona, CTA "Montar meu treino"
/gerar             Formulário multi-step + resultado do treino
/sobre             Sobre o app e a metodologia
```

## Formulário — campos coletados

Inputs que a IA usará para personalizar:

- **Sexo**: masculino, feminino, prefiro não dizer
- **Idade**
- **Nível**: iniciante, intermediário, avançado
- **Objetivo**: hipertrofia, emagrecimento, condicionamento, força, mobilidade
- **Local de treino**: academia completa, casa com equipamentos, casa sem equipamentos, ar livre
- **Dias por semana**: 1 a 7
- **Tempo por sessão**: 20, 30, 45, 60, 90 min
- **Foco/grupos preferidos** (opcional, multi-select): peito, costas, pernas, glúteos, braços, core, cardio
- **Restrições/lesões** (texto livre, opcional)

UX em formato step-by-step (3–4 passos) com barra de progresso, validação por etapa e resumo antes de gerar.

## Geração com IA

- Edge function `generate-workout` chama o **Lovable AI Gateway** com `google/gemini-3-flash-preview`
- Saída **estruturada via tool calling** (JSON garantido) com este formato:

```
{
  "titulo": "...",
  "resumo": "...",
  "diasPorSemana": 4,
  "duracaoMin": 45,
  "dias": [
    {
      "nome": "Dia A — Peito e Tríceps",
      "aquecimento": "...",
      "exercicios": [
        { "nome": "...", "series": 4, "reps": "8-10", "descanso": "60s", "observacao": "..." }
      ],
      "alongamento": "..."
    }
  ],
  "dicas": ["...", "..."]
}
```

- Tratamento de erros 429 (rate limit) e 402 (créditos) com toasts amigáveis

## Tela de resultado

- Cabeçalho com título, objetivo, nível, dias/semana, duração
- Tabs por dia de treino (Dia A, B, C…)
- Cada exercício em card: nome, séries × reps, descanso, observação
- Botões: **Refazer**, **Copiar**, **Imprimir/PDF** (via `window.print` com estilo dedicado)
- Sem persistência por enquanto (sem login) — o treino vive na sessão

## Identidade visual (design system)

Tokens em `src/styles.css` (oklch):

- `--background`: creme (#FFF6E9)
- `--foreground`: navy (#091E21)
- `--primary`: laranja (#FFAB0D), foreground navy
- `--secondary`: lavanda (#A6A8F0), foreground navy
- `--accent`: navy escuro para cards de destaque
- `--radius`: 1.25rem (cantos bem arredondados como na referência)

Elementos visuais:

- Formas geométricas (losangos) sutis no fundo do hero
- Cards com sombra suave e cantos grandes
- Botão primário laranja, secundário lavanda
- Tipografia: Inter (corpo) + um display bold para títulos (ex.: Plus Jakarta Sans ou Manrope, similar ao Gilroy)
- Modo claro como padrão (a referência é luminosa); dark mode opcional num passo futuro

## Detalhes técnicos

- TanStack Start + Tailwind v4, rotas em `src/routes/` (`index.tsx`, `gerar.tsx`, `sobre.tsx`)
- Formulário com `react-hook-form` + `zod`
- Componentes shadcn já disponíveis: `card`, `button`, `tabs`, `select`, `radio-group`, `checkbox`, `slider`, `progress`, `sonner` (toasts)
- **Lovable Cloud**: ativar para hospedar a edge function `generate-workout` que chama o Lovable AI Gateway com `LOVABLE_API_KEY` (chave fica no servidor, nunca no cliente)
- Sem banco de dados nesta versão

## Fora de escopo (sugestões para depois)

- Login + histórico de treinos salvos
- Acompanhamento de progresso (cargas, check-ins)
- Geração de imagem de capa do treino com IA
- Exportar como PDF estilizado (além do print)
