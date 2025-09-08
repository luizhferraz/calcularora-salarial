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