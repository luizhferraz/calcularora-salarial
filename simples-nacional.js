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

function calcularAliquotaEfetiva(receitaBruta12Meses, anexo) {
    const faixa = anexo.faixas.find((f, i) => 
        receitaBruta12Meses <= f.limite || i === anexo.faixas.length - 1
    );
    
    return (receitaBruta12Meses * faixa.aliquota - faixa.deducao) / receitaBruta12Meses;
}

function calcularImpostoDevido(valorMensal, receitaBruta12Meses, folhaPagamento12Meses) {
    const fatorR = calcularFatorR(folhaPagamento12Meses, receitaBruta12Meses);
    const anexo = determinarAnexo(fatorR);
    const aliquotaEfetiva = calcularAliquotaEfetiva(receitaBruta12Meses, anexo);
    
    return {
        receitaBruta: receitaBruta12Meses,
        fatorR: fatorR,
        anexoAplicado: fatorR >= 0.28 ? 'III' : 'V',
        aliquotaNominal: anexo.faixas.find(f => receitaBruta12Meses <= f.limite).aliquota,
        aliquotaEfetiva: aliquotaEfetiva,
        impostoDevido: valorMensal * aliquotaEfetiva
    };
}
