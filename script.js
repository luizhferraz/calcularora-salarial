function showCalculator(type) {
    document.getElementById('selectionScreen').style.display = 'none';
    document.getElementById('dolarCalc').style.display = type === 'dolar' ? 'block' : 'none';
    document.getElementById('pjCalc').style.display = type === 'pj' ? 'block' : 'none';
    document.getElementById('cltCalc').style.display = type === 'clt' ? 'block' : 'none';
    document.getElementById('result').style.display = 'none';
    
    const dollarFields = document.querySelectorAll('.dollar-only');
    dollarFields.forEach(field => {
        field.style.display = type === 'dolar' ? 'block' : 'none';
    });
}

function showSelectionScreen() {
    document.getElementById('selectionScreen').style.display = 'block';
    document.getElementById('dolarCalc').style.display = 'none';
    document.getElementById('pjCalc').style.display = 'none';
    document.getElementById('result').style.display = 'none';
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
    const salaryInput = document.getElementById('salaryPJ');
    const salaryStr = salaryInput.value.replace(/\./g, '').replace(',', '.');
    const grossSalary = parseFloat(salaryStr);

    if (isNaN(grossSalary) || grossSalary < 0) {
        alert('Por favor, insira um valor válido');
        return;
    }

    // Cálculo do Simples Nacional (6% para faixa inicial)
    const simplesNacional = grossSalary * 0.06;
    const netSalaryPJ = grossSalary - simplesNacional;
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    // Cálculo equivalente CLT
    // Para ter o mesmo custo que um PJ, considerando encargos do empregador
    const custoTotalPJ = grossSalary;
    const fatorCLT = 1.8; // Considerando FGTS, INSS patronal, 13º, férias e outros encargos
    const salarioCLTEquivalente = custoTotalPJ / fatorCLT;
    
    // Cálculo dos descontos CLT
    const inss = calcularINSS(salarioCLTEquivalente);
    const irrf = calcularIRRF(salarioCLTEquivalente - inss);
    const netSalaryCLT = salarioCLTEquivalente - inss - irrf;
    
    // Benefícios CLT mensalizados
    const fgts = salarioCLTEquivalente * 0.08;
    const decimoTerceiro = salarioCLTEquivalente / 12;
    const ferias = (salarioCLTEquivalente * 1.333) / 12; // 1/3 de férias
    const totalBeneficiosCLT = fgts + decimoTerceiro + ferias;
    
    // Formatar números
    const formatBRL = (value) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Exibir resultados
    document.getElementById('currentDate').textContent = currentDate;
    document.getElementById('exchangeRate').textContent = 'N/A';
    document.getElementById('originalValue').textContent = 'N/A';
    document.getElementById('convertedValue').textContent = formatBRL(grossSalary);
    document.getElementById('totalTaxes').textContent = formatBRL(simplesNacional);
    document.getElementById('netSalary').textContent = formatBRL(netSalaryPJ);
    
    // Detalhamento completo com comparativo CLT
    document.getElementById('taxDetails').textContent = 
        `=== Regime PJ ===\n` +
        `Simples Nacional (6%): R$ ${formatBRL(simplesNacional)}\n` +
        `Salário Líquido PJ: R$ ${formatBRL(netSalaryPJ)}\n\n` +
        `=== Equivalente CLT ===\n` +
        `Salário Bruto CLT: R$ ${formatBRL(salarioCLTEquivalente)}\n` +
        `INSS: R$ ${formatBRL(inss)}\n` +
        `IRRF: R$ ${formatBRL(irrf)}\n` +
        `Salário Líquido CLT: R$ ${formatBRL(netSalaryCLT)}\n\n` +
        `=== Benefícios CLT (mensalizados) ===\n` +
        `FGTS: R$ ${formatBRL(fgts)}\n` +
        `13º Salário: R$ ${formatBRL(decimoTerceiro)}\n` +
        `Férias + 1/3: R$ ${formatBRL(ferias)}\n` +
        `Total Benefícios: R$ ${formatBRL(totalBeneficiosCLT)}\n\n` +
        `=== Comparativo Final ===\n` +
        `Total Líquido PJ: R$ ${formatBRL(netSalaryPJ)}\n` +
        `Total Líquido CLT + Benefícios: R$ ${formatBRL(netSalaryCLT + totalBeneficiosCLT)}`;
    
    document.getElementById('result').style.display = 'block';
}

async function getExchangeRate() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        return data.rates.BRL;
    } catch (error) {
        console.error('Erro ao obter cotação:', error);
        return null;
    }
}

async function convertSalary() {
    const salaryInput = document.getElementById('salaryUSD');
    const salaryStr = salaryInput.value.replace(/\./g, '').replace(',', '.');
    const salary = parseFloat(salaryStr);

    if (isNaN(salary) || salary < 0) {
        alert('Por favor, insira um valor válido');
        return;
    }

    const rate = await getExchangeRate();
    if (!rate) {
        alert('Erro ao obter a cotação do dólar. Tente novamente mais tarde.');
        return;
    }

    const grossSalaryBRL = salary * rate;
    const currentDate = new Date().toLocaleDateString('pt-BR');

    // Cálculo dos impostos para consultoria de TI no Simples Nacional
    const aliquotaSimples = 0.06;  // 6% - Anexo III do Simples Nacional (exemplo para faixa inicial)
    const totalTaxes = grossSalaryBRL * aliquotaSimples;
    const netSalaryBRL = grossSalaryBRL - totalTaxes;

    // Exibir resultados
    document.getElementById('currentDate').textContent = currentDate;
    const formatBRL = (value) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    document.getElementById('exchangeRate').textContent = formatBRL(rate);
    document.getElementById('originalValue').textContent = formatBRL(salary);
    document.getElementById('convertedValue').textContent = formatBRL(grossSalaryBRL);
    document.getElementById('totalTaxes').textContent = formatBRL(totalTaxes);
    document.getElementById('netSalary').textContent = formatBRL(netSalaryBRL);
    document.getElementById('taxDetails').textContent = 
        `Simples Nacional (6%): R$ ${formatBRL(totalTaxes)}`;
    
    document.getElementById('result').style.display = 'block';
}

function calculateCLTSalary() {
    const salaryInput = document.getElementById('salaryCLT');
    const salaryStr = salaryInput.value.replace(/\./g, '').replace(',', '.');
    const grossSalary = parseFloat(salaryStr);

    if (isNaN(grossSalary) || grossSalary < 0) {
        alert('Por favor, insira um valor válido');
        return;
    }

    // Cálculo dos descontos
    const inss = calcularINSS(grossSalary);
    const baseIR = grossSalary - inss;
    const irrf = calcularIRRF(baseIR);
    
    // Benefícios
    const fgts = grossSalary * 0.08;
    const decimoTerceiro = grossSalary / 12;
    const ferias = (grossSalary * 1.333) / 12; // Inclui 1/3 de férias
    
    const totalDeductions = inss + irrf;
    const netSalary = grossSalary - totalDeductions;
    const totalBeneficios = fgts + decimoTerceiro + ferias;

    // Formatar números
    const formatBRL = (value) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const currentDate = new Date().toLocaleDateString('pt-BR');

    // Exibir resultados
    document.getElementById('currentDate').textContent = currentDate;
    document.getElementById('convertedValue').textContent = formatBRL(grossSalary);
    document.getElementById('totalTaxes').textContent = formatBRL(totalDeductions);
    document.getElementById('netSalary').textContent = formatBRL(netSalary);
    
    // Detalhamento
    document.getElementById('taxDetails').textContent = 
        `=== Descontos ===\n` +
        `INSS: R$ ${formatBRL(inss)}\n` +
        `IRRF: R$ ${formatBRL(irrf)}\n` +
        `Total Descontos: R$ ${formatBRL(totalDeductions)}\n\n` +
        `=== Benefícios (mensalizados) ===\n` +
        `FGTS: R$ ${formatBRL(fgts)}\n` +
        `13º Salário: R$ ${formatBRL(decimoTerceiro)}\n` +
        `Férias + 1/3: R$ ${formatBRL(ferias)}\n` +
        `Total Benefícios: R$ ${formatBRL(totalBeneficios)}\n\n` +
        `=== Resumo ===\n` +
        `Salário Bruto: R$ ${formatBRL(grossSalary)}\n` +
        `Salário Líquido: R$ ${formatBRL(netSalary)}\n` +
        `Custo Total (Líquido + Benefícios): R$ ${formatBRL(netSalary + totalBeneficios)}`;
    
    document.getElementById('result').style.display = 'block';
}