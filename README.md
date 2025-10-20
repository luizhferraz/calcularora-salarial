# Calculadora Salarial

Uma ferramenta web responsiva para cálculos e conversões salariais, incluindo comparativos entre regimes CLT e PJ.

## Funcionalidades

### 1. Conversor de Salário (USD → BRL)
- Conversão de salários de dólar para real usando cotação atual
- Input flexível: valor mensal ou valor hora
- Cotação do dólar em tempo real via API
- Exibição detalhada:
  - Valores em dólar (mensal, hora, anual)
  - Valores convertidos em reais
  - Cálculo automático dos impostos
  - Demonstrativo completo do Simples Nacional

### 2. Calculadora de Salário PJ
- Cálculo do salário líquido PJ com interface dedicada
- Input por salário mensal ou valor hora
- Campos adicionais para:
  - Folha de Pagamento 12 meses
  - Receita Bruta 12 meses
- Suporte ao Simples Nacional 2025:
  - Cálculo automático do Fator R
  - Definição dinâmica do anexo (III ou V)
  - Alíquotas e deduções por faixa
  - Demonstrativo detalhado dos cálculos

### 3. Interface Responsiva
- Layout adaptativo para diferentes dispositivos
- Visualização otimizada para mobile
- Separação clara entre:
  - Campos específicos do dólar
  - Campos específicos do PJ
  - Resultados comuns
- Botões e campos redimensionados para touch

### 4. Detalhamento de Impostos
#### Simples Nacional 2025
- Exibição da Receita Bruta Anual
- Fator R calculado
- Anexo aplicado (III ou V)
- Faixa de faturamento
- Alíquota nominal e efetiva
- Valor da dedução
- Imposto devido

### 3. Calculadora de Salário CLT
- Cálculo do salário líquido CLT
- INSS (tabela 2024)
- IRRF (tabela 2024)
- Detalhamento dos benefícios:
  - FGTS mensal
  - Férias + 1/3 mensalizados
  - 13º salário mensal
- Totalizadores:
  - Total de benefícios mensais
  - Salário líquido + benefícios
  - Salário anual com 13º

### 4. Comparativo CLT ↔ PJ
- Comparação detalhada lado a lado
- Valores CLT:
  - Todos os descontos e benefícios
  - Total mensal (líquido + benefícios)
  - Total anual incluindo 13º
- Valores PJ:
  - Valor bruto
  - Impostos (Simples Nacional)
  - Valor líquido
- Análise comparativa:
  - Diferença mensal entre regimes
  - Diferença anual entre regimes
  - Indicação do regime mais vantajoso

## Desenvolvimento Técnico

### Melhorias Recentes
1. Separação de componentes por tipo de cálculo
2. Correção do cálculo de impostos PJ
3. Interface mais intuitiva
4. Melhor organização do código
5. Tratamento de erros aprimorado

### Estrutura do Projeto
- HTML5 semântico
- CSS3 com media queries
- JavaScript modular
- Integração com API de cotação

### Próximas Atualizações
- Exportação de resultados
- Modo escuro
- Armazenamento local de configurações
- Comparativos mais detalhados

## Como Usar

1. Escolha o tipo de cálculo
2. Preencha os valores solicitados
3. Para cálculos PJ:
   - Informe salário ou valor hora
   - Opcionalmente, informe folha e receita
4. Para conversão USD:
   - Informe valor em dólar
   - Aguarde cotação atual
5. Visualize o resultado detalhado

## Limitações
- Cálculos baseados na legislação 2024/2025
- Valor hora fixo em 176h mensais

## Detalhes Técnicos

### Cálculos Implementados
- **CLT Anual**: 
  - 12 × (Salário Líquido + Benefícios)
  - Adicional do 13º salário bruto
- **Comparativo Anual**:
  - CLT: 12 meses + 13º
  - PJ: 12 meses de receita líquida