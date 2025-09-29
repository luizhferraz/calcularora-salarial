# Calculadora Salarial

Uma ferramenta web para cálculos e conversões salariais, incluindo comparativos entre regimes CLT e PJ.

## Funcionalidades

### 1. Conversor de Salário (USD → BRL)
- Conversão de salários de dólar para real
- Input por salário mensal ou valor hora
- Cálculo automático do valor hora/mensal
- Exibição da cotação do dólar atual
- Cálculo do salário anual em dólares
- Cálculo dos impostos considerando regras do Simples Nacional 2025

### 2. Calculadora de Salário PJ
- Cálculo do salário líquido PJ
- Input por salário mensal ou valor hora
- Cálculo automático do valor hora/mensal
- Suporte a diferentes regimes tributários:
  - Simples Nacional 2025 (com análise de Fator R)
  - Lucro Presumido
  - Lucro Real
- Detalhamento dos impostos aplicados
- Análise automática do enquadramento (Anexo III ou V)

### 3. Calculadora de Salário CLT
- Cálculo do salário líquido CLT
- Cálculo de INSS (tabela atualizada)
- Cálculo de IRRF
- Detalhamento dos benefícios

### 4. Comparativo CLT ↔ PJ
- Comparação lado a lado dos regimes
- Cálculo de benefícios CLT
- Projeção anual de ganhos
- Diferença mensal e anual entre regimes

## Detalhes Técnicos

### Cálculos Implementados
- **Valor Hora**: Base de 176 horas mensais
- **INSS**: Tabela progressiva 2024
- **IRRF**: Tabela progressiva 2024
- **Simples Nacional 2025**:
  - Fator R para determinação do anexo
  - Anexo III (se Fator R ≥ 28%)
  - Anexo V (se Fator R < 28%)
  - Alíquotas progressivas por faixa de faturamento
  - Deduções conforme tabela oficial 2025

### Tabelas do Simples Nacional 2025
#### Anexo III (Fator R ≥ 28%)
| Faixa | Receita Bruta 12 meses | Alíquota | Dedução |
|-------|------------------------|-----------|----------|
| 1ª    | Até 180.000           | 6,0%     | 0        |
| 2ª    | Até 360.000           | 11,2%    | 9.360    |
| ...mais faixas...

#### Anexo V (Fator R < 28%)
| Faixa | Receita Bruta 12 meses | Alíquota | Dedução |
|-------|------------------------|-----------|----------|
| 1ª    | Até 180.000           | 15,5%    | 0        |
| 2ª    | Até 360.000           | 18,0%    | 4.500    |
| ...mais faixas...

### Formatação
- Valores monetários no padrão brasileiro (R$ 1.234,56)
- Porcentagens com duas casas decimais

## Como Usar

1. Selecione o tipo de cálculo desejado
2. Insira os valores solicitados
3. Clique no botão de calcular
4. Verifique o resultado detalhado

## Tecnologias Utilizadas
- HTML5
- CSS3
- JavaScript (Vanilla)

## Limitações
- Cotação do dólar pode variar
- Valores de impostos baseados na legislação de 2023
- Cálculos consideram cenários padrão

## Desenvolvimento Futuro
- Adição de mais regimes tributários
- Personalização de benefícios CLT
- Exportação de resultados
- Simulação de cenários

## Contribuição
Contribuições são bem-vindas! Por favor, sinta-se à vontade para abrir issues ou enviar pull requests.