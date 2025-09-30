function showCalculator(type) {
    console.log('Showing calculator:', type); // Debug

    // Esconder tela de seleção
    document.getElementById('selectionScreen').style.display = 'none';

    // Esconder todas as calculadoras
    document.getElementById('dolarCalc').style.display = 'none';
    document.getElementById('pjCalc').style.display = 'none';
    document.getElementById('cltCalc').style.display = 'none';
    document.getElementById('compareCalc').style.display = 'none';
    document.getElementById('result').style.display = 'none';

    // Mostrar calculadora selecionada
    const selectedCalc = document.getElementById(type + 'Calc');
    if (selectedCalc) {
        selectedCalc.style.display = 'block';
    }

    // Limpar campos específicos
    if (type === 'dolar') {
        clearDollar();
    } else if (type === 'pj') {
        clearPJ();
    } else if (type === 'clt') {
        clearCLT();
    } else if (type === 'compare') {
        clearComparison();
    }

    // Esconder todos os elementos específicos
    document.querySelectorAll('.dollar-only, .pj-only').forEach(el => {
        el.style.display = 'none';
    });
    
    // Mostrar elementos específicos baseado no tipo
    if (type === 'dolar') {
        document.querySelectorAll('.dollar-only').forEach(el => {
            el.style.display = 'block';
        });
    } else if (type === 'pj') {
        document.querySelectorAll('.pj-only').forEach(el => {
            el.style.display = 'block';
        });
    }
}

function showSelectionScreen() {
    document.getElementById('selectionScreen').style.display = 'block';
    document.getElementById('dolarCalc').style.display = 'none';
    document.getElementById('pjCalc').style.display = 'none';
    const cltEl = document.getElementById('cltCalc');
    if (cltEl) cltEl.style.display = 'none';
    const compareEl = document.getElementById('compareCalc');
    if (compareEl) compareEl.style.display = 'none';
    document.getElementById('result').style.display = 'none';

    // garantir que componentes de comparativo não permaneçam visíveis
    const results = document.getElementById('compareResults');
    const summary = document.getElementById('compareSummary');
    if (results) results.style.display = 'none';
    if (summary) summary.style.display = 'none';
}

function calcularINSS(salario) {
    // Tabela INSS 2024
    if (salario <= 1412.00) {
        return salario * 0.075;
    } else if (salario <= 2666.68) {
        return (salario * 0.09) - 21.18;
    } else if (salario <= 4000.03) {
        return (salario * 0.12) - 101.18;
    } else if (salario <= 7786.02) {
        return (salario * 0.14) - 181.18;
    } else {
        return 908.86; // Teto INSS 2024
    }
}

function calcularIRRF(baseCalculo) {
    // Tabela IRRF 2024
    if (baseCalculo <= 2112.00) {
        return 0;
    } else if (baseCalculo <= 2826.65) {
        return (baseCalculo * 0.075) - 158.40;
    } else if (baseCalculo <= 3751.05) {
        return (baseCalculo * 0.15) - 370.40;
    } else if (baseCalculo <= 4664.68) {
        return (baseCalculo * 0.225) - 651.73;
    } else {
        return (baseCalculo * 0.275) - 884.96;
    }
}

function calculatePJSalary() {
    try {
        const salaryInput = document.getElementById('salaryPJ').value;
        const grossSalary = parseMoneyValue(salaryInput);
        const folhaPagamento = parseMoneyValue(document.getElementById('folhaPagamento')?.value || '0');
        const receitaBruta = parseMoneyValue(document.getElementById('receitaBruta')?.value || '0');
        
        if (isNaN(grossSalary) || grossSalary <= 0) {
            alert('Por favor, insira um valor válido para o salário');
            return;
        }

        // Usar mesma lógica de cálculo
        const receitaAnual = receitaBruta || grossSalary * 12;
        const folhaPagamentoAnual = folhaPagamento || receitaAnual * 0.28;
        const hourlyRate = grossSalary / 176;

        const resultado = calcularImpostoDevido(
            grossSalary,
            receitaAnual,
            folhaPagamentoAnual
        );

        const netSalary = grossSalary - resultado.impostoDevido;

        // Atualizar valores na tela
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('pt-BR');
        document.getElementById('pjHourly').textContent = formatCurrency(hourlyRate);
        document.getElementById('convertedValue').textContent = formatCurrency(grossSalary);
        document.getElementById('totalTaxes').textContent = formatCurrency(resultado.impostoDevido);
        document.getElementById('netSalary').textContent = formatCurrency(netSalary);

        // Atualizar detalhamento dos impostos
        document.getElementById('taxDetails').textContent = 
`Receita Bruta Anual: R$ ${formatCurrency(resultado.receitaBruta)}
Fator R: ${(resultado.fatorR * 100).toFixed(2)}%
Anexo Aplicado: ${resultado.anexoAplicado}
Faixa de Faturamento: até R$ ${formatCurrency(resultado.faixaUtilizada.limite)}
Alíquota Nominal: ${(resultado.aliquotaNominal * 100).toFixed(2)}%
Valor da Dedução: R$ ${formatCurrency(resultado.faixaUtilizada.deducao)}
Alíquota Efetiva: ${(resultado.aliquotaEfetiva * 100).toFixed(2)}%
Imposto Devido: R$ ${formatCurrency(resultado.impostoDevido)}`;

        document.getElementById('result').style.display = 'block';

    } catch (error) {
        console.error('Erro ao calcular salário PJ:', error);
        alert('Erro no cálculo. Verifique os valores informados.');
    }
}

// Função para formatar números
function formatCurrency(value) {
    if (typeof value !== 'number') return '0,00';
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Função para converter string em número
function parseMoneyValue(value) {
    if (typeof value !== 'string') return 0;
    return parseFloat(value.replace(/\./g, '').replace(',', '.'));
}

function calculateSimplesTax(monthlyRevenue) {
    // Calcula receita bruta anual
    const annualRevenue = monthlyRevenue * 12;
    
    // Tabela do Simples Nacional - Anexo III (2023)
    // Retorna { aliquota, deducao }
    let faixa;
    if (annualRevenue <= 180000) {
        faixa = { aliquota: 0.06, deducao: 0 };
    } else if (annualRevenue <= 360000) {
        faixa = { aliquota: 0.112, deducao: 9360 };
    } else if (annualRevenue <= 720000) {
        faixa = { aliquota: 0.135, deducao: 17640 };
    } else if (annualRevenue <= 1800000) {
        faixa = { aliquota: 0.16, deducao: 35640 };
    } else if (annualRevenue <= 3600000) {
        faixa = { aliquota: 0.21, deducao: 125640 };
    } else {
        faixa = { aliquota: 0.33, deducao: 648000 };
    }

    // Calcula alíquota efetiva
    const aliquotaEfetiva = ((annualRevenue * faixa.aliquota) - faixa.deducao) / annualRevenue;
    // Calcula imposto mensal
    const monthlyTax = monthlyRevenue * aliquotaEfetiva;

    return {
        tax: monthlyTax,
        effectiveRate: aliquotaEfetiva * 100,
        annualRevenue: annualRevenue
    };
}

async function convertSalary() {
    try {
        const salaryInput = document.getElementById('salaryUSD').value;
        const salaryUSD = parseMoneyValue(salaryInput);
        
        if (isNaN(salaryUSD) || salaryUSD <= 0) {
            alert('Por favor, insira um valor válido');
            return;
        }

        const rate = await getDollarRate();
        const convertedValue = salaryUSD * rate;
        const hourlyRate = salaryUSD / 176;
        const yearlyRate = salaryUSD * 12;
        const yearlyBRL = convertedValue * 12;
        
        // Usar mesma lógica do PJ
        const receitaAnual = yearlyBRL;
        const folhaPagamento = yearlyBRL * 0.28; // 28% para tentar Anexo III

        // Calcular impostos usando a mesma função do PJ
        const resultado = calcularImpostoDevido(
            convertedValue,    // valor mensal
            receitaAnual,     // receita bruta 12 meses
            folhaPagamento    // folha de pagamento 12 meses
        );

        const netSalary = convertedValue - resultado.impostoDevido;

        // Atualizar valores na tela
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('pt-BR');
        document.getElementById('exchangeRate').textContent = formatCurrency(rate);
        document.getElementById('originalValue').textContent = formatCurrency(salaryUSD);
        document.getElementById('hourlyUSD').textContent = formatCurrency(hourlyRate);
        document.getElementById('yearlyUSD').textContent = formatCurrency(yearlyRate);
        document.getElementById('convertedValue').textContent = formatCurrency(convertedValue);
        document.getElementById('totalTaxes').textContent = formatCurrency(resultado.impostoDevido);
        document.getElementById('netSalary').textContent = formatCurrency(netSalary);

        // Atualizar detalhamento dos impostos com mesmo formato do PJ
        document.getElementById('taxDetails').textContent = 
`Receita Bruta Anual: R$ ${formatCurrency(resultado.receitaBruta)}
Fator R: ${(resultado.fatorR * 100).toFixed(2)}%
Anexo Aplicado: ${resultado.anexoAplicado}
Faixa de Faturamento: até R$ ${formatCurrency(resultado.faixaUtilizada.limite)}
Alíquota Nominal: ${(resultado.aliquotaNominal * 100).toFixed(2)}%
Valor da Dedução: R$ ${formatCurrency(resultado.faixaUtilizada.deducao)}
Alíquota Efetiva: ${(resultado.aliquotaEfetiva * 100).toFixed(2)}%
Imposto Devido: R$ ${formatCurrency(resultado.impostoDevido)}`;

        document.getElementById('result').style.display = 'block';

    } catch (error) {
        console.error('Erro ao converter salário:', error);
        alert('Erro ao converter salário. Por favor, tente novamente.');
    }
}

// Funções para sincronizar campos de valor hora e salário mensal
function updateHourlyFromSalary() {
    const salary = parseMoneyValue(document.getElementById('salaryUSD').value);
    if (!isNaN(salary) && salary > 0) {
        const hourly = salary / 176;
        document.getElementById('hourlyUSDInput').value = formatCurrency(hourly);
    }
}

function updateSalaryFromHourly() {
    const hourly = parseMoneyValue(document.getElementById('hourlyUSDInput').value);
    if (!isNaN(hourly) && hourly > 0) {
        const salary = hourly * 176;
        document.getElementById('salaryUSD').value = formatCurrency(salary);
    }
}

function clearDollar() {
    document.getElementById('salaryUSD').value = '';
    document.getElementById('hourlyUSDInput').value = '';
    document.getElementById('result').style.display = 'none';
}

function updatePJHourlyFromSalary() {
    const salary = parseMoneyValue(document.getElementById('salaryPJ').value);
    if (!isNaN(salary) && salary > 0) {
        const hourly = salary / 176;
        document.getElementById('hourlyPJInput').value = formatCurrency(hourly);
    }
}

function updatePJSalaryFromHourly() {
    const hourly = parseMoneyValue(document.getElementById('hourlyPJInput').value);
    if (!isNaN(hourly) && hourly > 0) {
        const salary = hourly * 176;
        document.getElementById('salaryPJ').value = formatCurrency(salary);
    }
}

function clearPJ() {
    document.getElementById('salaryPJ').value = '';
    document.getElementById('hourlyPJInput').value = '';
    document.getElementById('folhaPagamento').value = '';
    document.getElementById('receitaBruta').value = '';
    document.getElementById('result').style.display = 'none';
}

function calculateCLTSalary() {
    try {
        const salaryInput = document.getElementById('salaryCLT').value;
        const grossSalary = parseMoneyValue(salaryInput);
        
        if (isNaN(grossSalary) || grossSalary <= 0) {
            alert('Por favor, insira um valor válido');
            return;
        }

        // Cálculos CLT
        const inss = calcularINSS(grossSalary);
        const baseIRRF = grossSalary - inss;
        const irrf = calcularIRRF(baseIRRF);
        const fgts = grossSalary * 0.08;
        const ferias = (grossSalary + (grossSalary / 3)) / 12; // Férias + 1/3
        const decimoTerceiro = grossSalary / 12;
        
        const liquidoCLT = grossSalary - inss - irrf;
        const beneficios = fgts + ferias + decimoTerceiro;
        const totalCLT = liquidoCLT + beneficios;

        // Atualizar valores na tela
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('pt-BR');
        document.getElementById('convertedValue').textContent = formatCurrency(grossSalary);
        document.getElementById('totalTaxes').textContent = formatCurrency(inss + irrf);
        document.getElementById('netSalary').textContent = formatCurrency(liquidoCLT);

        // Atualizar detalhamento dos impostos
        document.getElementById('taxDetails').textContent = 
`INSS (${((inss/grossSalary)*100).toFixed(2)}%): R$ ${formatCurrency(inss)}
IRRF (${((irrf/grossSalary)*100).toFixed(2)}%): R$ ${formatCurrency(irrf)}
FGTS (8%): R$ ${formatCurrency(fgts)}
Férias + 1/3 (mensal): R$ ${formatCurrency(ferias)}
13º Salário (mensal): R$ ${formatCurrency(decimoTerceiro)}
Total Benefícios: R$ ${formatCurrency(beneficios)}
Total Líquido + Benefícios: R$ ${formatCurrency(totalCLT)}`;

        document.getElementById('result').style.display = 'block';

    } catch (error) {
        console.error('Erro ao calcular salário CLT:', error);
        alert('Erro ao calcular salário CLT. Por favor, tente novamente.');
    }
}

function clearCLT() {
    document.getElementById('salaryCLT').value = '';
    document.getElementById('result').style.display = 'none';
}

function compareRegimes() {
    try {
        const cltSalary = parseMoneyValue(document.getElementById('compareCLT').value);
        const pjValue = parseMoneyValue(document.getElementById('comparePJ').value);

        if (isNaN(cltSalary) || isNaN(pjValue)) {
            alert('Por favor, insira valores válidos');
            return;
        }

        // Cálculos CLT (mantém os mesmos pois são de 2024)
        const inss = calcularINSS(cltSalary);
        const baseIRRF = cltSalary - inss;
        const irrf = calcularIRRF(baseIRRF);
        const fgts = cltSalary * 0.08;
        const ferias = (cltSalary + (cltSalary / 3)) / 12;
        const decimoTerceiro = cltSalary / 12;
        
        const liquidoCLT = cltSalary - inss - irrf;
        const beneficios = fgts + ferias + decimoTerceiro;
        const totalCLT = liquidoCLT + beneficios;

        // Cálculos PJ usando Simples Nacional 2025
        const pjAnual = pjValue * 12;
        const folhaPagamento = pjAnual * 0.28; // 28% para tentar enquadramento no Anexo III

        // Usar a nova função de cálculo do Simples Nacional 2025
        const resultado = calcularImpostoDevido(
            pjValue,           // valor mensal
            pjAnual,          // receita bruta 12 meses
            folhaPagamento    // folha de pagamento 12 meses
        );
        
        const liquidoPJ = pjValue - resultado.impostoDevido;

        // Atualizar tabela CLT
        document.getElementById('clt_bruto').textContent = formatCurrency(cltSalary);
        document.getElementById('clt_inss').textContent = formatCurrency(inss);
        document.getElementById('clt_irrf').textContent = formatCurrency(irrf);
        document.getElementById('clt_liquido').textContent = formatCurrency(liquidoCLT);
        document.getElementById('clt_fgts').textContent = formatCurrency(fgts);
        document.getElementById('clt_13').textContent = formatCurrency(decimoTerceiro);
        document.getElementById('clt_ferias').textContent = formatCurrency(ferias);
        document.getElementById('clt_beneficios').textContent = formatCurrency(beneficios);
        document.getElementById('clt_total').textContent = formatCurrency(totalCLT);

        // Atualizar tabela PJ com detalhamento do Simples Nacional 2025
        document.getElementById('pj_bruto').textContent = formatCurrency(pjValue);
        document.getElementById('pj_simples').textContent = 
            `${formatCurrency(resultado.impostoDevido)} (${resultado.aliquotaEfetiva.toFixed(2)}% - Anexo ${resultado.anexoAplicado})`;
        document.getElementById('pj_liquido').textContent = formatCurrency(liquidoPJ);

        // Calcular e mostrar diferenças
        const difMensal = liquidoPJ - totalCLT;
        const difAnual = difMensal * 12;

        document.getElementById('diff_mensal').textContent = 
            `${formatCurrency(difMensal)} ${difMensal > 0 ? '(favorável ao PJ)' : '(favorável ao CLT)'}`;
        document.getElementById('diff_anual').textContent = formatCurrency(difAnual);

        // Mostrar resultados
        document.getElementById('compareResults').style.display = 'block';
        document.getElementById('compareSummary').style.display = 'block';

    } catch (error) {
        console.error('Erro ao comparar regimes:', error);
        alert('Erro ao realizar comparação. Por favor, tente novamente.');
    }
}

function clearComparison() {
    // Limpar inputs
    document.getElementById('compareCLT').value = '';
    document.getElementById('comparePJ').value = '';

    // Esconder resultados
    document.getElementById('compareResults').style.display = 'none';
    document.getElementById('compareSummary').style.display = 'none';

    // Resetar valores das tabelas
    const elements = [
        'clt_bruto', 'clt_inss', 'clt_irrf', 'clt_liquido', 
        'clt_fgts', 'clt_13', 'clt_ferias', 'clt_beneficios', 
        'clt_total', 'pj_bruto', 'pj_simples', 'pj_liquido',
        'diff_mensal', 'diff_anual'
    ];
    
    elements.forEach(id => {
        document.getElementById(id).textContent = '-';
    });
}

async function getDollarRate() {
    try {
        const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
        const data = await response.json();
        return parseFloat(data.USDBRL.bid);
    } catch (error) {
        console.error('Erro ao obter cotação do dólar:', error);
        alert('Não foi possível obter a cotação do dólar. Usando valor padrão de R$ 5,00');
        return 5.00; // Valor fallback em caso de erro
    }
}