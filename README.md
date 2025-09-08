# Calculadora Salarial

Aplicação web com múltiplos calculadores para diferentes tipos de remuneração: conversão de salários em dólar, cálculos de salário PJ e CLT.

## Funcionalidades

### 1. Conversor USD → BRL
- Conversão de salários em dólares para reais
- Taxa de câmbio em tempo real via API
- Cálculo de impostos do Simples Nacional

### 2. Calculadora PJ
- Cálculo de salário líquido para Pessoa Jurídica
- Simulação de impostos do Simples Nacional
- Comparativo com regime CLT equivalente
- Detalhamento de benefícios perdidos/ganhos

### 3. Calculadora CLT
- Cálculo detalhado de salário líquido CLT
- INSS (tabela 2024)
- IRRF (tabela 2024)
- Demonstrativo de benefícios:
  - FGTS
  - 13º Salário
  - Férias + 1/3

## Como usar

1. Abra o arquivo `index.html` no navegador
2. Escolha o tipo de cálculo desejado
3. Digite o valor do salário
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