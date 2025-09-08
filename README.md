# Calculadora Salarial

Aplicação web com múltiplos calculadores para diferentes tipos de remuneração: conversão de salários em dólar, cálculos de salário PJ e CLT, e comparativo CLT ↔ PJ.

## Funcionalidades

### 1. Conversor USD → BRL
- Conversão de salários em dólares para reais
- Taxa de câmbio em tempo real via API
- Cálculo de impostos do Simples Nacional

### 2. Calculadora PJ
- Cálculo de salário líquido para Pessoa Jurídica
- Escolha do regime tributário: Simples Nacional, Lucro Presumido ou Lucro Real
- Simulação dos impostos de cada regime:
  - Simples Nacional: 6%
  - Lucro Presumido: IRPJ, CSLL, PIS, COFINS, ISS (alíquotas detalhadas)
  - Lucro Real: IRPJ, CSLL, PIS, COFINS, ISS (alíquotas detalhadas)
- Comparativo com regime CLT equivalente
- Detalhamento dos impostos e benefícios

### 3. Calculadora CLT
- Cálculo detalhado de salário líquido CLT
- INSS (tabela 2024)
- IRRF (tabela 2024)
- Demonstrativo de benefícios:
  - FGTS
  - 13º Salário
  - Férias + 1/3

### 4. Comparativo CLT ↔ PJ
- Entrada de dois valores: salário CLT (bruto) e valor PJ (bruto)
- Exibição de resultados em duas tabelas lado a lado:
  - Tabela CLT: salário bruto, INSS, IRRF, líquido, FGTS, 13º (mensalizado), férias + 1/3 (mensalizado), total de benefícios e total (líquido + benefícios)
  - Tabela PJ: valor bruto, Simples Nacional (6%) e valor líquido
- Sumário com diferença mensal e anual entre os regimes
- Ação "Limpar" para zerar os campos e ocultar os resultados
- Navegação: ao clicar em "Voltar", todos os painéis de resultado do comparativo são ocultados

## Como usar

1. Abra o arquivo `index.html` no navegador
2. Escolha o tipo de cálculo desejado
3. Para CLT/PJ, informe o valor bruto e clique em "Calcular". Para PJ, selecione o regime tributário desejado. Para o comparativo, informe os dois valores e clique em "Comparar" (use "Limpar" para reiniciar a tela).
4. Visualize o resultado detalhado com:
   - Valores bruto e líquido
   - Impostos e deduções
   - Benefícios (quando aplicável)
   - Comparativos entre regimes (quando aplicável)

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- Exchange Rate API (cotação USD/BRL)

## Observações

- Cálculos baseados na legislação brasileira atual
- Tabelas de INSS e IRRF atualizadas para 2024
- Simples Nacional considerando alíquota inicial do Anexo III
- Lucro Presumido e Lucro Real com alíquotas padrão para serviços de TI