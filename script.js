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
        // Limpar resultados anteriores
        document.getElementById('result').style.display = 'none';

        // Obter e validar o valor do salário
        const salaryInput = document.getElementById('salaryPJ').value
            .replace(/\./g, '')
            .replace(',', '.');
        const grossSalary = parseFloat(salaryInput);

        if (isNaN(grossSalary)) {
            alert('Por favor, insira um valor válido');
            return;
        }

        // Calcular valores
        const hourlyRate = grossSalary / 176; // 176 horas mensais
        const taxRate = 0.06; // 6% Simples Nacional
        const taxes = grossSalary * taxRate;
        const netSalary = grossSalary - taxes;

        // Atualizar data
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('pt-BR');

        // Atualizar valores
        document.getElementById('convertedValue').textContent = formatCurrency(grossSalary);
        document.getElementById('pjHourly').textContent = formatCurrency(hourlyRate);
        document.getElementById('totalTaxes').textContent = formatCurrency(taxes);
        document.getElementById('netSalary').textContent = formatCurrency(netSalary);

        // Atualizar detalhamento dos impostos
        document.getElementById('taxDetails').textContent = 
            `Simples Nacional (6%): R$ ${formatCurrency(taxes)}
Total de impostos: R$ ${formatCurrency(taxes)}`;

        // Mostrar apenas elementos relevantes para PJ
        document.querySelectorAll('.dollar-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.pj-only').forEach(el => el.style.display = 'block');
        
        // Mostrar resultado
        document.getElementById('result').style.display = 'block';

    } catch (error) {
        console.error('Erro ao calcular salário PJ:', error);
        alert('Erro ao calcular salário PJ. Por favor, tente novamente.');
    }
}

// Função auxiliar para formatação de moeda
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function calculatePJTaxes(grossAmount) {
    // Valores anualizados para determinar a faixa
    const annualGross = grossAmount * 12;
    
    // Tabela Simples Nacional 2023 - Anexo III (Serviços)
    let aliquota;
    let deducao;
    
    if (annualGross <= 180000) {
        aliquota = 0.06;
        deducao = 0;
    } else if (annualGross <= 360000) {
        aliquota = 0.1120;
        deducao = 9360;
    } else if (annualGross <= 720000) {
        aliquota = 0.1350;
        deducao = 17640;
    } else if (annualGross <= 1800000) {
        aliquota = 0.1600;
        deducao = 35640;
    } else if (annualGross <= 3600000) {
        aliquota = 0.2100;
        deducao = 125640;
    } else {
        aliquota = 0.3350;
        deducao = 648000;
    }
    
    // Calcula alíquota efetiva
    const aliquotaEfetiva = ((annualGross * aliquota) - deducao) / annualGross;
    
    // Calcula imposto mensal
    const monthlyTax = grossAmount * aliquotaEfetiva;
    
    return {
        tax: monthlyTax,
        effectiveRate: aliquotaEfetiva * 100
    };
}

async function convertSalary() {
    try {
        // Pegar e validar input
        let salaryUSD = document.getElementById('salaryUSD').value
            .replace(/\./g, '')
            .replace(',', '.');
        salaryUSD = parseFloat(salaryUSD);

        if (isNaN(salaryUSD)) {
            alert('Por favor, insira um valor válido');
            return;
        }

        // Obter taxa do dólar
        const rate = await getDollarRate();

        // Cálculos básicos
        const convertedValue = salaryUSD * rate;
        const hourlyRate = salaryUSD / 176;
        const yearlyRate = salaryUSD * 12;

        // Usar novo cálculo para PJ
        const pjTaxes = calculatePJTaxes(convertedValue);
        const totalTaxes = pjTaxes.tax;
        const netSalary = convertedValue - totalTaxes;

        // Atualizar detalhamento dos impostos
        document.getElementById('taxDetails').textContent = 
            `Simples Nacional (${pjTaxes.effectiveRate.toFixed(2)}%): R$ ${formatCurrency(totalTaxes)}
Total de impostos: R$ ${formatCurrency(totalTaxes)}`;

        // Atualizar elementos
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('pt-BR');
        document.getElementById('exchangeRate').textContent = formatCurrency(rate);
        document.getElementById('originalValue').textContent = formatCurrency(salaryUSD);
        document.getElementById('convertedValue').textContent = formatCurrency(convertedValue);
        document.getElementById('hourlyUSD').textContent = formatCurrency(hourlyRate);
        document.getElementById('yearlyUSD').textContent = formatCurrency(yearlyRate);
        document.getElementById('totalTaxes').textContent = formatCurrency(totalTaxes);
        document.getElementById('netSalary').textContent = formatCurrency(netSalary);

        // Mostrar resultado
        document.getElementById('result').style.display = 'block';

    } catch (error) {
        console.error('Erro ao converter salário:', error);
        alert('Erro ao converter salário. Por favor, tente novamente.');
    }
}

// Função para obter cotação do dólar
async function getDollarRate() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        return data.rates.BRL;
    } catch (error) {
        console.error('Erro ao obter cotação:', error);
        return 5.00; // Valor padrão em caso de erro
    }
}

function calculateINSS(salary) {
    // Tabela INSS 2023 com faixas progressivas
    let inss = 0;
    
    if (salary <= 1320) {
        inss = salary * 0.075;
    } else if (salary <= 2571.29) {
        inss = (1320 * 0.075) + ((salary - 1320) * 0.09);
    } else if (salary <= 3856.94) {
        inss = (1320 * 0.075) + ((2571.29 - 1320) * 0.09) + ((salary - 2571.29) * 0.12);
    } else if (salary <= 7507.49) {
        inss = (1320 * 0.075) + ((2571.29 - 1320) * 0.09) + ((3856.94 - 2571.29) * 0.12) + ((salary - 3856.94) * 0.14);
    } else {
        // Teto do INSS
        inss = 877.24;
    }
    
    return inss;
}

function calculateIRRF(baseCalculo) {
    // Tabela IRRF 2023
    let irrf = 0;
    
    if (baseCalculo <= 1903.98) {
        irrf = 0;
    } else if (baseCalculo <= 2826.65) {
        irrf = (baseCalculo * 0.075) - 142.80;
    } else if (baseCalculo <= 3751.05) {
        irrf = (baseCalculo * 0.15) - 354.80;
    } else if (baseCalculo <= 4664.68) {
        irrf = (baseCalculo * 0.225) - 636.13;
    } else {
        irrf = (baseCalculo * 0.275) - 869.36;
    }
    
    return Math.max(0, irrf); // Garante que o IRRF não seja negativo
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

function compareRegimes() {
    const cltInput = document.getElementById('compareCLT');
    const pjInput = document.getElementById('comparePJ');
    
    const cltStr = cltInput.value.replace(/\./g, '').replace(',', '.');
    const pjStr = pjInput.value.replace(/\./g, '').replace(',', '.');
    
    const cltSalary = parseFloat(cltStr);
    const pjSalary = parseFloat(pjStr);

    if (isNaN(cltSalary) || isNaN(pjSalary) || cltSalary < 0 || pjSalary < 0) {
        alert('Por favor, insira valores válidos');
        return;
    }

    // Cálculos CLT
    const inss = calcularINSS(cltSalary);
    const baseIR = cltSalary - inss;
    const irrf = calcularIRRF(baseIR);
    const totalDeductionsCLT = inss + irrf;
    const netSalaryCLT = cltSalary - totalDeductionsCLT;

    // Benefícios CLT
    const fgts = cltSalary * 0.08;
    const decimoTerceiro = cltSalary / 12;
    const ferias = (cltSalary * 1.333) / 12;
    const totalBeneficiosCLT = fgts + decimoTerceiro + ferias;

    // Cálculos PJ
    const simplesNacional = pjSalary * 0.06;
    const netSalaryPJ = pjSalary - simplesNacional;

    // Formatar números
    const formatBRL = (value) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const currentDate = new Date().toLocaleDateString('pt-BR');

    // Preencher tabelas lado a lado
    document.getElementById('clt_bruto').textContent = `R$ ${formatBRL(cltSalary)}`;
    document.getElementById('clt_inss').textContent = `R$ ${formatBRL(inss)}`;
    document.getElementById('clt_irrf').textContent = `R$ ${formatBRL(irrf)}`;
    document.getElementById('clt_liquido').textContent = `R$ ${formatBRL(netSalaryCLT)}`;
    document.getElementById('clt_fgts').textContent = `R$ ${formatBRL(fgts)}`;
    document.getElementById('clt_13').textContent = `R$ ${formatBRL(decimoTerceiro)}`;
    document.getElementById('clt_ferias').textContent = `R$ ${formatBRL(ferias)}`;
    document.getElementById('clt_beneficios').textContent = `R$ ${formatBRL(totalBeneficiosCLT)}`;
    document.getElementById('clt_total').textContent = `R$ ${formatBRL(netSalaryCLT + totalBeneficiosCLT)}`;

    document.getElementById('pj_bruto').textContent = `R$ ${formatBRL(pjSalary)}`;
    document.getElementById('pj_simples').textContent = `R$ ${formatBRL(simplesNacional)}`;
    document.getElementById('pj_liquido').textContent = `R$ ${formatBRL(netSalaryPJ)}`;

    // Sumário
    const diffMensal = (netSalaryCLT + totalBeneficiosCLT) - netSalaryPJ;
    const diffAnual = (netSalaryCLT + totalBeneficiosCLT) * 12 - netSalaryPJ * 12;
    document.getElementById('diff_mensal').textContent = `R$ ${formatBRL(Math.abs(diffMensal))} ${diffMensal >= 0 ? '(CLT > PJ)' : '(PJ > CLT)'}`;
    document.getElementById('diff_anual').textContent = `R$ ${formatBRL(Math.abs(diffAnual))} ${diffAnual >= 0 ? '(CLT > PJ)' : '(PJ > CLT)'}`;

    document.getElementById('currentDate').textContent = currentDate;
    document.getElementById('compareResults').style.display = 'flex';
    document.getElementById('compareSummary').style.display = 'block';
}

function clearComparison() {
    const cltInput = document.getElementById('compareCLT');
    const pjInput = document.getElementById('comparePJ');
    if (cltInput) cltInput.value = '';
    if (pjInput) pjInput.value = '';

    const idsToClear = [
        'clt_bruto','clt_inss','clt_irrf','clt_liquido','clt_fgts','clt_13','clt_ferias','clt_beneficios','clt_total',
        'pj_bruto','pj_simples','pj_liquido','diff_mensal','diff_anual'
    ];
    idsToClear.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '-';
    });

    const results = document.getElementById('compareResults');
    const summary = document.getElementById('compareSummary');
    if (results) results.style.display = 'none';
    if (summary) summary.style.display = 'none';

    const dateEl = document.getElementById('currentDate');
    if (dateEl) dateEl.textContent = '';
}

function clearDollar() {
    const input = document.getElementById('salaryUSD');
    if (input) input.value = '';
    document.getElementById('result').style.display = 'none';
    const taxDetails = document.getElementById('taxDetails');
    if (taxDetails) taxDetails.textContent = '';
}

function clearPJ() {
    const input = document.getElementById('salaryPJ');
    if (input) input.value = '';
    document.getElementById('result').style.display = 'none';
    const taxDetails = document.getElementById('taxDetails');
    if (taxDetails) taxDetails.textContent = '';
}

function clearCLT() {
    const input = document.getElementById('salaryCLT');
    if (input) input.value = '';
    document.getElementById('result').style.display = 'none';
    const taxDetails = document.getElementById('taxDetails');
    if (taxDetails) taxDetails.textContent = '';
}