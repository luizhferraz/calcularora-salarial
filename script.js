function showCalculator(type) {
    document.getElementById('selectionScreen').style.display = 'none';
    document.getElementById('dolarCalc').style.display = type === 'dolar' ? 'block' : 'none';
    document.getElementById('pjCalc').style.display = type === 'pj' ? 'block' : 'none';
    document.getElementById('cltCalc').style.display = type === 'clt' ? 'block' : 'none';
    const compareEl = document.getElementById('compareCalc');
    if (compareEl) {
        compareEl.style.display = type === 'compare' ? 'block' : 'none';
        if (type === 'compare') {
            // garantir que a tela inicie limpa
            clearComparison();
        }
    }
    document.getElementById('result').style.display = 'none';
    
    const dollarFields = document.querySelectorAll('.dollar-only');
    dollarFields.forEach(field => {
        field.style.display = type === 'dolar' ? 'block' : 'none';
    });
    
    // Esconder todos os elementos específicos
    document.querySelectorAll('.dollar-only, .pj-calculator-only').forEach(el => el.style.display = 'none');
    
    // Mostrar elementos específicos baseado no tipo
    if (type === 'dolar') {
        document.querySelectorAll('.dollar-only').forEach(el => el.style.display = 'block');
    } else if (type === 'pj') {
        document.querySelectorAll('.pj-calculator-only').forEach(el => el.style.display = 'block');
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
        
        if (isNaN(grossSalary) || grossSalary <= 0) {
            alert('Por favor, insira um valor válido');
            return;
        }

        // Calcular impostos usando a tabela do Simples Nacional
        const simplesTotals = calculateSimplesTax(grossSalary);
        const totalTaxes = simplesTotals.tax;
        const netSalary = grossSalary - totalTaxes;
        const hourlyRate = grossSalary / 176;

        // Atualizar valores na tela
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('pt-BR');
        document.getElementById('convertedValue').textContent = formatCurrency(grossSalary);
        document.getElementById('pjHourly').textContent = formatCurrency(hourlyRate);
        document.getElementById('totalTaxes').textContent = formatCurrency(totalTaxes);
        document.getElementById('netSalary').textContent = formatCurrency(netSalary);

        // Atualizar detalhamento dos impostos
        document.getElementById('taxDetails').textContent = 
`Receita Anual Projetada: R$ ${formatCurrency(simplesTotals.annualRevenue)}
Simples Nacional (${simplesTotals.effectiveRate.toFixed(2)}%): R$ ${formatCurrency(totalTaxes)}
Total de impostos: R$ ${formatCurrency(totalTaxes)}`;

        document.getElementById('result').style.display = 'block';

    } catch (error) {
        console.error('Erro ao calcular salário PJ:', error);
        alert('Erro ao calcular salário PJ. Por favor, tente novamente.');
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
        // Pegar valor do input e converter para número
        const salaryInput = document.getElementById('salaryUSD').value;
        const salaryUSD = parseMoneyValue(salaryInput);
        
        if (isNaN(salaryUSD) || salaryUSD <= 0) {
            alert('Por favor, insira um valor válido');
            return;
        }

        // Obter cotação e fazer cálculos básicos
        const rate = await getDollarRate();
        const convertedValue = salaryUSD * rate;
        const hourlyRate = salaryUSD / 176;
        const yearlyRate = salaryUSD * 12;

        // Cálculos de impostos simplificados (6% Simples Nacional)
        const simplesTotals = calculateSimplesTax(convertedValue);
        const totalTaxes = simplesTotals.tax;
        const netSalary = convertedValue - totalTaxes;

        // Atualizar valores na tela
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('pt-BR');
        document.getElementById('exchangeRate').textContent = formatCurrency(rate);
        document.getElementById('originalValue').textContent = formatCurrency(salaryUSD);
        document.getElementById('hourlyUSD').textContent = formatCurrency(hourlyRate);
        document.getElementById('yearlyUSD').textContent = formatCurrency(yearlyRate);
        document.getElementById('convertedValue').textContent = formatCurrency(convertedValue);
        document.getElementById('totalTaxes').textContent = formatCurrency(totalTaxes);
        document.getElementById('netSalary').textContent = formatCurrency(netSalary);

        // Atualizar detalhamento dos impostos com alíquota efetiva
        document.getElementById('taxDetails').textContent = 
`Receita Anual Projetada: R$ ${formatCurrency(simplesTotals.annualRevenue)}
Simples Nacional (${simplesTotals.effectiveRate.toFixed(2)}%): R$ ${formatCurrency(totalTaxes)}
Total de impostos: R$ ${formatCurrency(totalTaxes)}`;

        // Mostrar resultado
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
    document.getElementById('result').style.display = 'none';
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