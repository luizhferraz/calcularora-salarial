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
    const salary = parseFloat(salaryInput.value);

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
    document.getElementById('exchangeRate').textContent = rate.toFixed(2);
    document.getElementById('originalValue').textContent = salary.toFixed(2);
    document.getElementById('convertedValue').textContent = grossSalaryBRL.toFixed(2);
    document.getElementById('totalTaxes').textContent = totalTaxes.toFixed(2);
    document.getElementById('netSalary').textContent = netSalaryBRL.toFixed(2);
    document.getElementById('taxDetails').textContent = 
        `Simples Nacional (6%): R$ ${totalTaxes.toFixed(2)}`;
    
    document.getElementById('result').style.display = 'block';
}