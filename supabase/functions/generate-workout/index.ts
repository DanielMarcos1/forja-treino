// Edge function: gera plano de treino estruturado via Lovable AI Gateway
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const input = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Você é um personal trainer experiente. Monte planos de treino seguros, equilibrados e progressivos, adaptados ao perfil. Use português do Brasil. Seja prático e específico (séries, repetições, descanso). Inclua aquecimento e alongamento curtos. Considere restrições e equipamentos disponíveis. Distribua os grupos musculares de forma inteligente entre os dias.`;

    const userPrompt = `Monte um plano de treino com base nestes dados:
- Sexo: ${input.sexo}
- Idade: ${input.idade}
- Nível: ${input.nivel}
- Objetivo: ${input.objetivo}
- Local: ${input.local}
- Dias por semana: ${input.dias}
- Tempo por sessão: ${input.tempo} minutos
- Foco preferido: ${(input.foco && input.foco.length) ? input.foco.join(", ") : "sem preferência"}
- Restrições/lesões: ${input.restricoes || "nenhuma"}

Gere exatamente ${input.dias} dias de treino.`;

    const tool = {
      type: "function",
      function: {
        name: "montar_treino",
        description: "Retorna o plano de treino estruturado",
        parameters: {
          type: "object",
          properties: {
            titulo: { type: "string" },
            resumo: { type: "string" },
            diasPorSemana: { type: "number" },
            duracaoMin: { type: "number" },
            dias: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  nome: { type: "string" },
                  aquecimento: { type: "string" },
                  exercicios: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        nome: { type: "string" },
                        series: { type: "number" },
                        reps: { type: "string" },
                        descanso: { type: "string" },
                        observacao: { type: "string" },
                      },
                      required: ["nome", "series", "reps", "descanso"],
                      additionalProperties: false,
                    },
                  },
                  alongamento: { type: "string" },
                },
                required: ["nome", "aquecimento", "exercicios", "alongamento"],
                additionalProperties: false,
              },
            },
            dicas: { type: "array", items: { type: "string" } },
          },
          required: ["titulo", "resumo", "diasPorSemana", "duracaoMin", "dias", "dicas"],
          additionalProperties: false,
        },
      },
    };

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "montar_treino" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await resp.text();
      console.error("Gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "Erro ao gerar treino" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) {
      return new Response(JSON.stringify({ error: "Resposta inválida da IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const treino = JSON.parse(call.function.arguments);
    return new Response(JSON.stringify({ treino }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-workout error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
