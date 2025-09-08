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