const ANEXO_III = {
    faixas: [
        { limite: 180000, aliquota: 0.06, deducao: 0 },
        { limite: 360000, aliquota: 0.112, deducao: 9360 },
        { limite: 720000, aliquota: 0.135, deducao: 17640 },
        { limite: 1800000, aliquota: 0.16, deducao: 35640 },
        { limite: 3600000, aliquota: 0.21, deducao: 125640 },
        { limite: 4800000, aliquota: 0.33, deducao: 648000 }
    ]
};

const ANEXO_V = {
    faixas: [
        { limite: 180000, aliquota: 0.155, deducao: 0 },
        { limite: 360000, aliquota: 0.18, deducao: 4500 },
        { limite: 720000, aliquota: 0.195, deducao: 9900 },
        { limite: 1800000, aliquota: 0.205, deducao: 17100 },
        { limite: 3600000, aliquota: 0.23, deducao: 62100 },
        { limite: 4800000, aliquota: 0.305, deducao: 540000 }
    ]
};

function calcularFatorR(folhaPagamento12Meses, receitaBruta12Meses) {
    return folhaPagamento12Meses / receitaBruta12Meses;
}

function determinarAnexo(fatorR) {
    return fatorR >= 0.28 ? ANEXO_III : ANEXO_V;
}

function encontrarFaixaCorreta(receitaBruta12Meses, faixas) {
    // Garante que estamos usando a faixa correta mesmo com valores no limite
    for (let i = 0; i < faixas.length; i++) {
        if (receitaBruta12Meses <= faixas[i].limite) {
            return faixas[i];
        }
    }
    return faixas[faixas.length - 1]; // Última faixa para valores acima do limite
}

function calcularAliquotaEfetiva(receitaBruta12Meses, anexo) {
    if (receitaBruta12Meses > 4800000) {
        return {
            aliquota: 0.3350,
            valorDeducao: 0,
            efetiva: 0.3350
        };
    }

    const faixa = encontrarFaixaCorreta(receitaBruta12Meses, anexo.faixas);
    const aliquotaEfetiva = (receitaBruta12Meses * faixa.aliquota - faixa.deducao) / receitaBruta12Meses;
    
    return {
        aliquota: faixa.aliquota,
        valorDeducao: faixa.deducao,
        efetiva: aliquotaEfetiva
    };
}

function calcularImpostoDevido(valorMensal, receitaBruta12Meses, folhaPagamento12Meses) {
    try {
        // Validações de entrada
        if (valorMensal <= 0 || receitaBruta12Meses <= 0) {
            throw new Error('Valores devem ser maiores que zero');
        }

        // Cálculo do Fator R
        const fatorR = folhaPagamento12Meses / receitaBruta12Meses;
        const anexoAplicado = fatorR >= 0.28 ? ANEXO_III : ANEXO_V;
        
        // Cálculo da alíquota
        const calculo = calcularAliquotaEfetiva(receitaBruta12Meses, anexoAplicado);
        
        // Log para debugging
        console.log({
            receitaAnual: receitaBruta12Meses,
            fatorR: fatorR,
            anexo: fatorR >= 0.28 ? 'III' : 'V',
            aliquotaNominal: calculo.aliquota,
            deducao: calculo.valorDeducao,
            aliquotaEfetiva: calculo.efetiva
        });

        return {
            receitaBruta: receitaBruta12Meses,
            fatorR: fatorR,
            anexoAplicado: fatorR >= 0.28 ? 'III' : 'V',
            aliquotaNominal: calculo.aliquota,
            aliquotaEfetiva: calculo.efetiva,
            impostoDevido: valorMensal * calculo.efetiva,
            faixaUtilizada: encontrarFaixaCorreta(receitaBruta12Meses, anexoAplicado.faixas)
        };
    } catch (error) {
        console.error('Erro no cálculo:', error);
        throw error;
    }
}

// Função auxiliar para validar cálculos
function validarCalculos(valor) {
    const testes = [
        { mensal: 10000, anual: 120000 }, // Primeira faixa
        { mensal: 20000, anual: 240000 }, // Segunda faixa
        { mensal: 40000, anual: 480000 }, // Terceira faixa
        { mensal: 100000, anual: 1200000 }, // Quarta faixa
        { mensal: 200000, anual: 2400000 }, // Quinta faixa
        { mensal: 350000, anual: 4200000 }  // Sexta faixa
    ];

    testes.forEach(teste => {
        const resultadoIII = calcularImpostoDevido(teste.mensal, teste.anual, teste.anual * 0.30);
        const resultadoV = calcularImpostoDevido(teste.mensal, teste.anual, teste.anual * 0.20);
        console.log(`\nTeste para valor mensal: ${teste.mensal}`);
        console.log('Anexo III:', resultadoIII);
        console.log('Anexo V:', resultadoV);
    });
}
