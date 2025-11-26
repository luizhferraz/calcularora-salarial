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

// --- ADDED: função resiliente para obter cotação do dólar (fallbacks) ---
async function getDollarRate() {
	const endpoints = [
		{
			url: 'https://economia.awesomeapi.com.br/last/USD-BRL',
			parse: data => parseFloat(data?.USDBRL?.bid)
		},
		{
			url: 'https://api.exchangerate.host/latest?base=USD&symbols=BRL',
			parse: data => parseFloat(data?.rates?.BRL)
		},
		{
			url: 'https://open.er-api.com/v6/latest/USD',
			parse: data => parseFloat(data?.rates?.BRL)
		}
	];

	for (const ep of endpoints) {
		try {
			const resp = await fetch(ep.url, { cache: 'no-store' });
			if (!resp.ok) {
				console.warn(`API ${ep.url} respondeu com status ${resp.status}`);
				continue;
			}
			const data = await resp.json();
			const rate = ep.parse(data);
			if (rate && !isNaN(rate)) {
				console.info(`Cotação obtida de ${ep.url}: ${rate}`);
				return rate;
			} else {
				console.warn(`Resposta inválida de ${ep.url}`, data);
			}
		} catch (err) {
			console.warn(`Falha ao acessar ${ep.url}:`, err);
		}
	}

	console.error('Todas as tentativas de obter cotação falharam. Usando fallback R$ 5,00');
	return 5.00; // fallback seguro
}

// Função para calcular salário PJ
function calculatePJSalary() {
    try {
        const salaryInput = document.getElementById('salaryPJ').value;
        const grossSalary = parseMoneyValue(salaryInput);
        
        if (isNaN(grossSalary) || grossSalary <= 0) {
            alert('Por favor, insira um valor válido para o salário');
            return;
        }

        // Usar mesma lógica de cálculo
        // Receita anual calculada a partir do bruto mensal
        const receitaAnual = grossSalary * 12;
        // Se houver campo de folha (removido por padrão), use-o; senão envie 0 para indicar "folha desconhecida"
        const folhaEl = document.getElementById('folhaPagamento');
        const folhaPagamentoAnual = folhaEl ? parseMoneyValue(folhaEl.value || '0') : 0;
		const hourlyRate = grossSalary / 176;

        let resultado;
        if (typeof calcularImpostoDevido === 'function') {
            resultado = calcularImpostoDevido(
                grossSalary,
                receitaAnual,
                folhaPagamentoAnual
            );
        } else {
            console.warn('calcularImpostoDevido não definido — usando fallback de imposto');
            resultado = impostoFallbackMensal(grossSalary);
        }

        // Mostrar aviso de anexo no resultado (se aplicável)
        showAnexoWarning('anexoWarning', resultado);

        const netSalary = grossSalary - resultado.impostoDevido;
        const annualSalary = netSalary * 12;  // Calculando salário anual

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
Imposto Devido: R$ ${formatCurrency(resultado.impostoDevido)}
Salário Líquido Anual: R$ ${formatCurrency(annualSalary)}`;

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
        
        // Usar mesma lógica do PJ: receita anual do valor convertido.
        const receitaAnual = yearlyBRL;
        // tentar ler campo de folha se existir (padrão removed); se não, passar 0
        const folhaEl = document.getElementById('folhaPagamento');
        const folhaPagamento = folhaEl ? parseMoneyValue(folhaEl.value || '0') : 0;
        // Calcular impostos usando a mesma função do PJ
        let resultado;
         if (typeof calcularImpostoDevido === 'function') {
             resultado = calcularImpostoDevido(
                 convertedValue,    // valor mensal em R$
                 receitaAnual,      // receita bruta 12 meses
                 folhaPagamento     // folha de pagamento 12 meses
             );
         } else {
             console.warn('calcularImpostoDevido não definido — usando fallback de imposto');
             resultado = impostoFallbackMensal(convertedValue);
         }

        // Mostrar aviso de anexo no resultado (se aplicável)
        showAnexoWarning('anexoWarning', resultado);

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
    const salaryEl = document.getElementById('salaryPJ');
    if (salaryEl) salaryEl.value = '';
    const hourlyEl = document.getElementById('hourlyPJInput');
    if (hourlyEl) hourlyEl.value = '';
    // limpar folha de pagamento se existir (campo opcional reintroduzido)
    const folhaEl = document.getElementById('folhaPagamento');
    if (folhaEl) folhaEl.value = '';
    const resultEl = document.getElementById('result');
    if (resultEl) resultEl.style.display = 'none';
}

function calculateCLTSalary() {
    try {
        const salaryInput = document.getElementById('salaryCLT').value;
        const grossSalary = parseMoneyValue(salaryInput);

        // Ler novos campos opcionais
        const valeAlimentacao = parseMoneyValue(document.getElementById('valeAlimentacao')?.value || '0');
        const outrosBeneficios = parseMoneyValue(document.getElementById('outrosBeneficios')?.value || '0');
        
        if (isNaN(grossSalary) || grossSalary <= 0) {
            alert('Por favor, insira um valor válido');
            return;
        }

        // Cálculos CLT
        const inss = calcularINSS(grossSalary);
        const baseIRRF = grossSalary - inss;
        const irrf = calcularIRRF(baseIRRF);
        const fgts = grossSalary * 0.08;
        const ferias = (grossSalary + (grossSalary / 3)) / 12;
        const decimoTerceiro = grossSalary / 12;
        
        // Salário líquido sem os campos opcionais
        let liquidoCLT = grossSalary - inss - irrf;

        // Somar os valores opcionais diretamente ao líquido (não alteram INSS/IRRF)
        liquidoCLT += valeAlimentacao + outrosBeneficios;

        const beneficios = fgts + ferias + decimoTerceiro; // continua sendo benefícios calculados
        const totalCLT = liquidoCLT + beneficios;

        // Salário anual: 12x (líquido + benefícios) + 13º bruto
        const salarioAnual = (totalCLT * 12) + grossSalary; // mantém 13º como salário bruto adicional

        // Atualizar valores na tela
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('pt-BR');
        document.getElementById('convertedValue').textContent = formatCurrency(grossSalary);
        document.getElementById('totalTaxes').textContent = formatCurrency(inss + irrf);
        document.getElementById('netSalary').textContent = formatCurrency(liquidoCLT);

        // Atualizar detalhamento dos impostos e itens opcionais
        document.getElementById('taxDetails').textContent = 
`INSS (${((inss/grossSalary)*100).toFixed(2)}%): R$ ${formatCurrency(inss)}
IRRF (${((irrf/grossSalary)*100).toFixed(2)}%): R$ ${formatCurrency(irrf)}
FGTS (8%): R$ ${formatCurrency(fgts)}
Férias + 1/3 (mensal): R$ ${formatCurrency(ferias)}
13º Salário (mensal): R$ ${formatCurrency(decimoTerceiro)}
Vale Alimentação (mensal): R$ ${formatCurrency(valeAlimentacao)}
Outros Benefícios (mensal): R$ ${formatCurrency(outrosBeneficios)}
Total Benefícios (FGTS + férias + 13º mensalizado): R$ ${formatCurrency(beneficios)}
Total Líquido + Benefícios: R$ ${formatCurrency(totalCLT)}
Salário Anual (incluindo 13º): R$ ${formatCurrency(salarioAnual)}`;

        document.getElementById('result').style.display = 'block';

    } catch (error) {
        console.error('Erro ao calcular salário CLT:', error);
        alert('Erro ao calcular salário CLT. Por favor, tente novamente.');
    }
}

function clearCLT() {
    // limpar novo campos também
    const salaryEl = document.getElementById('salaryCLT');
    if (salaryEl) salaryEl.value = '';
    const valeEl = document.getElementById('valeAlimentacao');
    if (valeEl) valeEl.value = '';
    const outrosEl = document.getElementById('outrosBeneficios');
    if (outrosEl) outrosEl.value = '';
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
        const totalAnualCLT = (totalCLT * 12) + cltSalary; // 12 meses + 13º

        // Cálculos PJ usando Simples Nacional 2025
        const pjAnual = pjValue * 12;
        // tentar ler campo de folha se existir; caso contrário passar 0 para indicar desconhecido
        const folhaEl = document.getElementById('folhaPagamento');
        const folhaPagamento = folhaEl ? parseMoneyValue(folhaEl.value || '0') : 0;
        // Usar a nova função de cálculo do Simples Nacional 2025
        let resultado;
         if (typeof calcularImpostoDevido === 'function') {
             resultado = calcularImpostoDevido(
                 pjValue,           // valor mensal
                 pjAnual,          // receita bruta 12 meses
                 folhaPagamento    // folha de pagamento 12 meses
             );
         } else {
             console.warn('calcularImpostoDevido não definido — usando fallback de imposto');
             resultado = impostoFallbackMensal(pjValue);
         }

        // Mostrar aviso de anexo no painel comparativo (se aplicável)
        showAnexoWarning('compareAnexoWarning', resultado);

        // Calcular e mostrar diferenças
        const difMensal = liquidoPJ - totalCLT;
        const difAnual = difMensal * 12;

        safeSetText('diff_mensal', formatCurrency(difMensal));
        safeSetText('diff_anual', formatCurrency(difAnual));

        // Recomendação considerando o fator configurável (ex.: 38%)
        const recommendationEl = document.getElementById('compareSummary');
        let recommendationText = '';
        if (meetsThreshold) {
            recommendationText = `<p style="margin:6px 0; color:green;"><strong>Recomendação:</strong> PJ atende ao critério (≥ ${thresholdPercent.toFixed(0)}% do total CLT). PJ recomendado.</p>`;
        } else {
            recommendationText = `<p style="margin:6px 0; color:#b35300;"><strong>Recomendação:</strong> PJ não atende ao critério de +${thresholdPercent.toFixed(0)}%. Faltam R$ ${formatCurrency(gapMonthly)} (${gapPercent.toFixed(2)}%) por mês para atingir o limiar de R$ ${formatCurrency(thresholdMonthly)}.</p>`;
        }
        recommendationText += `<p style="margin:6px 0; font-size:0.95em;">(Critério aplicado: PJ precisa ser ≥ ${thresholdPercent.toFixed(0)}% do Total CLT para ser considerado vantajoso)</p>`;

        if (recommendationEl) {
            recommendationEl.style.display = 'block';
            recommendationEl.innerHTML = recommendationText;
        } else {
            console.warn('Elemento compareSummary não encontrado; recomendação não exibida.');
        }

        // Mostrar resultados
        safeShow('compareResults', true);

    } catch (error) {
        console.error('Erro ao comparar regimes:', error);
        alert('Erro ao realizar comparação. Por favor, tente novamente.');
    }
}

// --- LIGHTWEIGHT FALLBACK helpers para imposto quando calcularImpostoDevido não existir ---
// retorna um objeto com a mesma shape mínima esperada pelo restante do código
function impostoFallbackMensal(valorMensal) {
	// tenta usar calculateSimplesTax se existir, senão aplica alíquota fixa de 6%
	if (typeof calculateSimplesTax === 'function') {
		const t = calculateSimplesTax(valorMensal);
		return {
			impostoDevido: t.tax,
			receitaBruta: t.annualRevenue,
			fatorR: 0,
			anexoAplicado: '-',
			aliquotaNominal: t.effectiveRate / 100,
			aliquotaEfetiva: t.effectiveRate / 100,
			faixaUtilizada: { limite: t.annualRevenue, deducao: 0 }
		};
	}
	const imposto = valorMensal * 0.06;
	return {
		impostoDevido: imposto,
		receitaBruta: valorMensal * 12,
		fatorR: 0,
		anexoAplicado: '-',
		aliquotaNominal: 0.06,
		aliquotaEfetiva: 0.06,
		faixaUtilizada: { limite: valorMensal * 12, deducao: 0 }
	};
}

// Helpers seguros para DOM (evitam "Cannot set properties of null")
function safeSetText(id, value) {
	const el = document.getElementById(id);
	if (el) el.textContent = value;
	else console.warn(`Elemento não encontrado: ${id}`);
}
function safeSetHTML(id, html) {
	const el = document.getElementById(id);
	if (el) el.innerHTML = html;
	else console.warn(`Elemento não encontrado: ${id}`);
}
function safeShow(id, flag) {
	const el = document.getElementById(id);
	if (el) el.style.display = flag ? 'block' : 'none';
	else console.warn(`Elemento não encontrado: ${id}`);
}

function clearComparison() {
    // Limpar inputs
    safeSetText('compareCLT',''); // direct inputs are fields, keep them empty via element access
    const cltInput = document.getElementById('compareCLT');
    if (cltInput) cltInput.value = '';
    const pjInput = document.getElementById('comparePJ');
    if (pjInput) pjInput.value = '';

    // Esconder resultados
    safeShow('compareResults', false);
    safeShow('compareSummary', false);

    // Resetar valores das tabelas
    const elements = [
        'clt_bruto', 'clt_inss', 'clt_irrf', 'clt_liquido', 
        'clt_fgts', 'clt_13', 'clt_ferias', 'clt_beneficios', 
        'clt_total', 'clt_anual', 'pj_bruto', 'pj_simples', 
        'pj_liquido', 'pj_anual', 'diff_mensal', 'diff_anual'
    ];
    
    elements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '-';
    });
}

// Mostrar/ocultar aviso após cálculos. Adicionei uma função utilitária showAnexoWarning() e a utilizei em calculatePJSalary, convertSalary e compareRegimes logo após determinarem `resultado`.
function showAnexoWarning(containerId, resultado) {
    const el = document.getElementById(containerId);
    if (!el) return;

    // Mostrar aviso apenas se houve erro/fallback no cálculo do anexo
    if (!resultado || resultado.anexoAplicado === 'Erro - fallback') {
        el.style.display = 'block';
        el.textContent = 'Aviso: não foi possível determinar o anexo corretamente ou foi usado fallback no cálculo. Resultados podem estar usando valores conservadores.';
        return;
    }

    // Caso contrário, não exibir aviso (não mostrar aviso para Anexo V ou III)
    el.style.display = 'none';
    el.textContent = '';
}