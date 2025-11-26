# Calculadora Salarial

Ferramenta web responsiva para cálculos e comparativos salariais (CLT ↔ PJ) com suporte a conversão USD → BRL.

Resumo das principais funcionalidades (últimas alterações)
- Conversor USD → BRL com cotação em tempo real (múltiplos endpoints e fallback).
- Calculadora PJ:
  - Entrada por valor mensal ou hora.
  - Campo opcional: Folha de Pagamento 12 meses (R$) — recomendado para cálculo do Fator R em serviços de TI.
  - O anexo aplicado no Simples Nacional foi definido para Anexo III de forma fixa para a categoria "consultoria/serviços de TI" (decisão solicitada). Mesmo quando a folha não for informada, o sistema usa Anexo III (não mostrará aviso de Anexo V).
  - Exibe alíquota nominal, alíquota efetiva, faixa utilizada e imposto devido.
  - Exibe Salário Líquido Mensal e Salário Líquido Anual.
  - Se o módulo de cálculo do Simples (simples-nacional.js) não estiver disponível, o app usa fallback (função interna) com alíquota conservadora.
- Calculadora CLT:
  - INSS e IRRF (tabelas 2024).
  - Cálculo de FGTS, férias (mensalizado) e 13º (mensalizado).
  - Novos campos opcionais (não obrigatórios) incluídos:
    - Vale Alimentação (mensal)
    - Outros Benefícios (mensal)
  - Esses valores opcionais são somados ao salário líquido mensal e ao salário anual (não alteram INSS/IRRF).
- Comparativo CLT ↔ PJ:
  - Mostra valores mensais e anuais (CLT: inclui 13º; PJ: 12 meses de líquido).
  - Exibe detalhamento de impostos de ambos os regimes.
  - Regra de recomendação configurável:
    - Por padrão PJ é considerado vantajoso se o líquido mensal PJ for ≥ 38% do Total (Líquido + Benefícios) do CLT.
    - Percentual configurável via input opcional com id `pjThreshold` (valor em %). Se presente, usa esse percentual em vez do default.
  - Mostra diferença mensal/anual e mensagem clara sobre recomendação e quanto falta para atingir o limiar.

UI / UX e responsividade
- Layout responsivo com media-queries (breakpoints 768px e 480px).
- Botões com estilo "pill" (arredondados), com foco e hover melhorados.
- Painel principal com cards e hints (small.hint) para inputs importantes.
- Resultados separados por tipo (campos específicos para dólar, PJ, CLT) para evitar confusão.

Resiliência e fallback
- `getDollarRate()` tenta múltiplos endpoints (awesomeapi, exchangerate.host, open.er-api) e retorna fallback R$ 5,00 se todas falharem.
- Se `calcularImpostoDevido` não estiver disponível, o app usa `impostoFallbackMensal()` (usa `calculateSimplesTax()` se presente, senão aplica alíquota fixa).
- Logs no console informam quando fallbacks são usados; a UI mostra aviso visível somente em caso de erro/fallback (não mostra aviso quando Anexo III é aplicado, pois está forçado).

Campos novos e IDs relevantes
- CLT:
  - `salaryCLT` — salário bruto mensal
  - `valeAlimentacao` — vale alimentação (mensal, opcional)
  - `outrosBeneficios` — outros benefícios (mensal, opcional)
- PJ:
  - `salaryPJ`, `hourlyPJInput`
  - `folhaPagamento` — folha anual 12 meses (opcional; recomendada para cálculo do Fator R)
- Conversor USD:
  - `salaryUSD`, `hourlyUSDInput`
- Comparativo:
  - `compareCLT`, `comparePJ`
  - `pjThreshold` — opcional, percentual (em %) para limiar de comparação
  - `compareResults`, `compareSummary` — áreas de resultado

Notas de implementação e operação
- A decisão de forçar Anexo III foi aplicada para consultoria/serviços de TI conforme solicitado.
- Caso futuramente deseje que a escolha do anexo volte a ser dinâmica (usar Fator R para escolher III vs V), remova o comportamento de "forçar III" em simples-nacional.js — a opção da folha já está presente na UI para suportar esse cálculo.
- Testes sugeridos:
  - Verificar cálculo PJ com e sem `folhaPagamento` preenchida.
  - Validar comparativo com diferentes valores de `pjThreshold`.
  - Testar conversor USD simulando falha de API para verificar fallback.

Próximas melhorias recomendadas
- Máscaras de entrada (monetárias) para todos os inputs.
- Validação inline para campos opcionais (ex.: alerta amigável quando folha não informada).
- Exportação de resultados (PDF/CSV).
- Indicador visual de "fallback" no UI para mostrar quando a cotação ou o cálculo de imposto usou fallback.

Contato e manutenção
- Arquivos chave:
  - /Users/luizferraz/Documents/labs/calcularora-salarial/index.html
  - /Users/luizferraz/Documents/labs/calcularora-salarial/styles.css
  - /Users/luizferraz/Documents/labs/calcularora-salarial/script.js
  - /Users/luizferraz/Documents/labs/calcularora-salarial/simples-nacional.js