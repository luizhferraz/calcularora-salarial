# Calculadora Salarial

Ferramenta web responsiva para cálculos e comparativos salariais (CLT ↔ PJ) com suporte a conversão USD → BRL.

Resumo das principais funcionalidades (últimas alterações)
- Conversor USD → BRL com cotação em tempo real (vários endpoints e fallback).
- Calculadora PJ:
  - Entrada por valor mensal ou hora.
  - Campos opcionais para Folha de Pagamento 12 meses e Receita Bruta 12 meses.
  - Cálculo de imposto via regras do Simples Nacional (arquivo simples-nacional.js).
  - Exibe alíquota nominal, alíquota efetiva, faixa utilizada, fator R e imposto devido.
  - Exibe Salário Líquido Mensal e Salário Líquido Anual.
  - Se simples-nacional.js não estiver disponível, usa fallback (calculateSimplesTax ou alíquota fixa 6%).
- Calculadora CLT:
  - INSS e IRRF (tabelas 2024).
  - Cálculo de FGTS, férias (mensalizado) e 13º (mensalizado).
  - Novos campos opcionais (não obrigatórios):
    - Vale Alimentação (mensal)
    - Outros Benefícios (mensal)
  - Esses valores opcionais são somados ao salário líquido mensal e ao salário anual (não afetam INSS/IRRF).
- Comparativo CLT ↔ PJ:
  - Mostra valores mensais e anuais (CLT: inclui 13º; PJ: 12 meses de líquido).
  - Exibe detalhamento de impostos de ambos os regimes.
  - Regra de recomendação configurável:
    - Por padrão PJ é considerado vantajoso se o líquido mensal PJ for ≥ 38% (valor padrão) do Total (Líquido + Benefícios) do CLT.
    - Percentual configurável via input opcional com id `pjThreshold` (valor em %). Se presente, usa esse percentual em vez do default.
  - Mostra diferença mensal/anual e mensagem clara sobre recomendação e quanto falta para atingir o limiar.

UI / UX e responsividade
- Layout responsivo com media-queries (breakpoints 768px e 480px).
- Botões com estilo "pill" (arredondados), com foco e hover melhorados.
- Painel principal com cards e hints (small.hint) para inputs importantes.
- Resultados separados por tipo (campos específicos para dólar e PJ/CLT) para evitar confusão.

Resiliência e fallback
- Função `getDollarRate()` tenta múltiplos endpoints (awesomeapi, exchangerate.host, open.er-api) e retorna fallback R$ 5,00 se todas falharem.
- Ao detectar ausência de `calcularImpostoDevido` (por exemplo se simples-nacional.js não carregar), o app usa um `impostoFallbackMensal()` que tenta `calculateSimplesTax()` ou aplica alíquota fixa de 6% como último recurso.
- Logs no console informam quando fallbacks são usados; evitar alerts intrusivos.

Campos novos e IDs relevantes
- CLT:
  - `salaryCLT` — salário bruto mensal
  - `valeAlimentacao` — vale alimentação (mensal, opcional)
  - `outrosBeneficios` — outros benefícios (mensal, opcional)
- PJ:
  - `salaryPJ`, `hourlyPJInput`, `regimePJ`, `folhaPagamento`, `receitaBruta`
- Conversor USD:
  - `salaryUSD`, `hourlyUSDInput`
- Comparativo:
  - `compareCLT`, `comparePJ`
  - `pjThreshold` — opcional, percentual (em %) para limiar de comparação
  - `compareResults`, `compareSummary` — áreas de resultado

Notas de implementação e operação
- Certifique-se de incluir `simples-nacional.js` antes de `script.js` (ou ambos com `defer` e ordem correta) para usar a implementação completa do Simples Nacional.
- Testes sugeridos:
  - Valores limítrofes das faixas do Simples Nacional (ex.: 180k, 360k, 720k, 1.8M, 3.6M).
  - Comparativo com e sem `pjThreshold` especificado.
  - Conversor USD testando falha de API (desligar rede ou simular CORS) para validar fallback.
- Formatação: valores exibidos no padrão pt-BR (R$ 1.234,56).

Próximas melhorias recomendadas
- Máscaras de entrada (monetárias) para todos os inputs.
- Input para ajustar o fator R real no comparativo (usar folha informada).
- Exportar resultados (PDF/CSV).
- Indicador visual de "fallback" no UI para avisar quando cotação ou cálculo de imposto usou fallback.
