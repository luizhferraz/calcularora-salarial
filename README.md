# Calculadora Salarial

Uma ferramenta web responsiva para cálculos e conversões salariais, incluindo comparativos entre regimes CLT e PJ.

## Funcionalidades

### 1. Conversor de Salário (USD → BRL)
- Conversão de salários de dólar para real usando cotação atual
- Input por salário mensal ou valor hora (com sincronização automática)
- Cálculo automático do valor hora/mensal
- Exibição da cotação do dólar em tempo real via API
- Cálculo do salário anual em dólares
- Cálculo dos impostos usando regras do Simples Nacional 2025

### 2. Calculadora de Salário PJ
- Cálculo do salário líquido PJ
- Input flexível: valor mensal ou valor hora
- Cálculo automático valor hora/mensal (base 176h)
- Campos para Folha de Pagamento e Receita Bruta 12 meses
- Suporte a diferentes regimes tributários:
  - Simples Nacional 2025 (com Fator R)
  - Lucro Presumido
  - Lucro Real
- Detalhamento completo dos impostos

### 3. Calculadora de Salário CLT
- Cálculo do salário líquido CLT
- INSS (tabela 2024)
- IRRF (tabela 2024)
- Detalhamento dos benefícios
- Cálculo de férias e 13º mensalizados

### 4. Comparativo CLT ↔ PJ
- Comparação lado a lado dos regimes
- Cálculo detalhado de benefícios CLT
- Análise do enquadramento PJ (Anexo III ou V)
- Indicação do regime mais vantajoso
- Diferença mensal e anual entre regimes

## Detalhes Técnicos

### Layout Responsivo
- Interface adaptativa para diferentes dispositivos
- Suporte a smartphones e tablets
- Botões e campos otimizados para touch
- Tamanhos de fonte ajustáveis
- Layout fluido com breakpoints em 768px e 480px

### Cálculos Implementados
- **Valor Hora**: Base de 176 horas mensais
- **INSS**: Tabela progressiva 2024
- **IRRF**: Tabela progressiva 2024
- **Simples Nacional 2025**:
  - Fator R para determinação do anexo
  - Anexo III (se Fator R ≥ 28%)
  - Anexo V (se Fator R < 28%)
  - Alíquotas progressivas
  - Deduções conforme tabela oficial

### APIs Integradas
- Cotação do dólar em tempo real
- Fallback para valor padrão em caso de erro

### Formatação
- Valores monetários no padrão brasileiro (R$ 1.234,56)
- Porcentagens com duas casas decimais
- Layout responsivo e adaptativo

## Como Usar

1. Selecione o tipo de cálculo desejado
2. Insira os valores solicitados (mensal ou hora)
3. Preencha informações adicionais se necessário
4. Clique no botão de calcular
5. Verifique o resultado detalhado

## Tecnologias Utilizadas
- HTML5
- CSS3 (com Media Queries)
- JavaScript (Vanilla)
- APIs RESTful

## Limitações
- Cotação do dólar pode variar
- Valores de impostos baseados na legislação atual
- Cálculos consideram cenários padrão

## Próximas Atualizações
- PWA (Progressive Web App)
- Modo offline
- Temas claro/escuro
- Exportação de resultados em PDF