// ------------- Identificación de la lista de feriados ------------
const generarListaFeriados = (v_fechaBase, v_numCuotas, v_diasFeriado) => {
    const numAnios = Math.ceil(v_numCuotas / 12);
    const anioInicio = new Date(v_fechaBase.getFullYear(), v_fechaBase.getMonth() + 2, 0).getFullYear();
    const anioFin = new Date(v_fechaBase.getFullYear(), v_fechaBase.getMonth() + 1 + v_numCuotas, 0).getFullYear();
    let resultado = [];
    for (anio = anioInicio; anio <= anioFin; anio++) {
        for (i = 0; i < v_diasFeriado.length; i++) {
            const fechaFeriado = new Date(anio, v_diasFeriado[i].split('/')[1] - 1, v_diasFeriado[i].split('/')[0]);
            resultado.push(fechaFeriado);
        }
    }
    return resultado;
};


// ------------- Identificación de las fechas de pago -------------
const definirFechaPagoMes = (v_fechaBase, v_numMes, v_fechasFeriado, v_diaPago) => {
    const fecha_sig_numDiasMes = new Date(v_fechaBase.getFullYear(), v_fechaBase.getMonth() + 1 + v_numMes, 0).getDate();
    const limite_iter_dia_feriado = 4;
    const evaluar_feriado = (fechaEval) => {
        return !!v_fechasFeriado.find(fecha => fecha.valueOf() === fechaEval.valueOf());
    };
    let resultado = (v_diaPago <= fecha_sig_numDiasMes) ? new Date(v_fechaBase.getFullYear(), v_fechaBase.getMonth() + v_numMes, v_diaPago) : new Date(v_fechaBase.getFullYear(), v_fechaBase.getMonth() + v_numMes, fecha_sig_numDiasMes);

    // if (v_numMes == 1) {
    //     console.log('-        v_diaPago', v_diaPago);
    //     console.log('-        fecha_sig_numDiasMes', fecha_sig_numDiasMes);
    //     console.log('-        resultado', resultado);
    // }

    let aux_iter = 0;
    while ((resultado.getDay() === 0 || evaluar_feriado(resultado) === true) && aux_iter < limite_iter_dia_feriado) {
        aux_iter += 1;
        resultado.setDate(resultado.getDate() + 1);
    }
    return resultado;
};
const identificarFechasPago = (v_fechaIni, v_numCuotas, v_fechasFeriado, v_diaPago) => {
    let resultado = [];
    for (mes = 1; mes <= v_numCuotas; mes++) {
        resultado.push(definirFechaPagoMes(v_fechaIni, mes, v_fechasFeriado, v_diaPago));
    }
    return resultado;
};


// ------------- Identificación de los días de cobro -------------
const identificarDiasCobro = (v_fechaBase, v_fechasPago, v_numCuotas) => {
    const resultado = [];
    let aux_fechaAnterior = v_fechaBase;
    for (i = 0; i < v_numCuotas; i++) {
        const numDias = Math.round((v_fechasPago[i].getTime() - aux_fechaAnterior.getTime()) / (1000 * 3600 * 24));
        resultado.push(numDias);
        aux_fechaAnterior = v_fechasPago[i];
    }
    return resultado;
};


// ------------- Determinación de la cuota de trancisión -------------
const identificarCuotaTransicion = (v_nroCuotasFija, v_nroCuotas, v_fechasPago, v_fechaRevTasa) => {
    let resultado = 0;
    if (v_nroCuotasFija > 0) {
        //if (v_nroCuotasFija <= v_nroCuotas) {
        if (v_fechaRevTasa <= v_fechasPago[v_fechasPago.length - 1]) {
            resultado = 0;
            for (i = 0; i < v_fechasPago.length; i++) {
                if (v_fechasPago[i] > v_fechaRevTasa) {
                    resultado = i + 1;
                    break;
                }
            }
        } else {
            resultado = v_nroCuotas + 1;
        }
    } else {
        resultado = 0;
    }

    // if (v_nroCuotasFija < v_nroCuotas && v_nroCuotasFija > 0) {
    //     for (i = 0; i < v_fechasPago.length; i++) {
    //         if (v_fechasPago[i] > v_fechaRevTasa) {
    //             resultado = i + 1;
    //             break;
    //         }
    //     }
    // }
    return resultado;
};



// ------------- Determinación si se abona capital en la primera cuota -------------
const identificarAbonoCuota1 = (v_fechaIni, v_fechasPago) => {
    // Se identifica la fecha de inicio mas 30 días
    const fechaIni_mas30 = v_fechaIni;
    fechaIni_mas30.setDate(fechaIni_mas30.getDate() + 30);
    //se define si esa fecha se cumple hasta la 1ra cuota, si no se cumple no se cobra el capital en la 1ra cuota
    const resultado = fechaIni_mas30 <= v_fechasPago[0] ? true : false;
    return resultado;
};


// const identificarAbonoCuota1 = (v_nroCuotaTransicion, v_nroCuotasFija, v_numCuotas) => {
//     // let resultado = true;
//     // if (v_nroCuotaTransicion > v_numCuotas) { // | v_nroCuotaTransicion <= 0
//     //     resultado = true;
//     // } else {
//     //     resultado = v_nroCuotaTransicion > v_nroCuotasFija ? false : true;
//     // }
//     const resultado = v_nroCuotaTransicion > v_nroCuotasFija ? false : true;
//     return resultado;
// };



// ------------- Identificación de la cuota mensual base -------------
const cuotaMensualBase = (v_monto, v_num_cuotas, v_int_anual) => {
    const v_int_mesual = v_int_anual / 12;
    const v_factor = 1 / Math.pow((1 + v_int_mesual), v_num_cuotas);
    const resultado = Math.round(Math.abs(v_monto / (1 - (v_factor / v_int_mesual))) * 100) / 100;
    return resultado;
};


// ------------- Construcción del plan de pagos -------------
const planPagos = (v_montoIni, v_numCuotaIni, v_num_cuotas, v_int_anual, v_monto_cuota, v_abonarCuota1, v_diasCobro) => {
    const v_int_dia = v_int_anual / 360;
    let resultado = [];
    let v_saldo = v_montoIni;
    for (numCuota = v_numCuotaIni; numCuota <= v_num_cuotas; numCuota++) {
        const interes = Math.round(v_diasCobro[numCuota - 1] * v_int_dia * v_saldo * 100) / 100;
        const capital = (numCuota === 1 & v_abonarCuota1 === false) || v_monto_cuota < interes ? 0 : Math.round((v_monto_cuota - interes) * 100) / 100;
        const saldo_ant = v_saldo;
        const saldo_nue = Math.round((saldo_ant - capital) * 100) / 100;
        v_saldo = saldo_nue;
        const detalleCuota = [v_diasCobro[numCuota - 1], interes, capital, saldo_ant, saldo_nue];
        resultado.push(detalleCuota);
    }
    return resultado;
};


// ------------- Identificación del saldo en la última cuota -------------
const saldoUltCuota = (v_montoIni, v_numCuotaIni, v_num_cuotas, v_int_anual, v_monto_cuota, v_abonarCuota1, v_diasCobro) => {
    const v_int_dia = v_int_anual / 360;
    let resultado = 0;
    let v_saldo = v_montoIni;
    for (numCuota = v_numCuotaIni; numCuota <= v_num_cuotas; numCuota++) {
        const interes = Math.round(v_diasCobro[numCuota - 1] * v_int_dia * v_saldo * 100) / 100;
        const capital = numCuota === 1 & v_abonarCuota1 === false ? 0 : Math.round((v_monto_cuota - interes) * 100) / 100;
        const saldo_ant = v_saldo;
        const saldo_nue = Math.round((saldo_ant - capital) * 100) / 100;
        v_saldo = saldo_nue;
        if (numCuota === v_num_cuotas) {
            resultado = saldo_nue;
        }
    }
    return resultado;
};


// ------------- Identificación de la cuota mensual correcta -------------
const determinacionCuota = (v_montoIni, v_numCuotaIni, v_numCuotasTotal, v_int_anual, v_abonarCuota1, v_diasCobro, v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo) => { // (v_montoIni, v_numCuotaIni, v_num_cuotas, v_int_anual, v_abonarCuota1)
    // Identificación del número de cuotas
    v_num_cuotas = v_numCuotasTotal - v_numCuotaIni + 1;

    // console.log('v_montoIni', v_montoIni);
    // console.log('v_numCuotaIni', v_numCuotaIni);
    // console.log('v_numCuotasTotal', v_numCuotasTotal);
    // console.log('v_int_anual', v_int_anual);
    // console.log('v_abonarCuota1', v_abonarCuota1);
    // console.log('v_num_cuotas', v_num_cuotas);

    // Cuota inicial
    const v_cuo_0 = cuotaMensualBase(v_montoIni, v_num_cuotas - 1, v_int_anual);
    const v_ult_0 = saldoUltCuota(v_montoIni, v_numCuotaIni, v_numCuotasTotal, v_int_anual, v_cuo_0, v_abonarCuota1, v_diasCobro);
    // console.log('v_cuo_0:', v_cuo_0, 'v_ult_0:', v_ult_0);

    // Se verifica que se inicia en un saldo negativo (de la última cuota)
    const v_incremento_base = Math.round(v_cuo_0 * v_binCuota_porcentIntervalo * 100) / 100;
    let v_cuota_base = v_cuo_0;
    let v_ultSaldo_base = v_ult_0;
    let numIter = 0;
    if (v_ultSaldo_base > 0) {
        numIter = 0;
        while (v_ultSaldo_base > 0 && v_cuota_base > 0 && numIter < v_limiteIteraciones) { //&& v_cuota_base < v_cuo_0 * 1.5
            v_cuota_base = Math.round((v_cuota_base + v_incremento_base) * 100) / 100;
            v_ultSaldo_base = saldoUltCuota(v_montoIni, v_numCuotaIni, v_numCuotasTotal, v_int_anual, v_cuota_base, v_abonarCuota1, v_diasCobro);
            numIter = numIter + 1;
        }
    }
    // console.log('v_cuota_base:', v_cuota_base, 'v_ultSaldo_base NEGATIVO:', v_ultSaldo_base);

    // Se identifica el rango para una búsqueda binaria
    // console.log('----------Se identifica el rango para una búsqueda binaria');
    let v_decremento_bin = Math.round(v_cuo_0 * v_binCuota_porcentIntervalo * 100) / 100;
    let v_cuota_dec = v_cuota_base;
    let v_ultSaldo_dec = v_ultSaldo_base;
    // console.log('Antes: v_decremento_bin:', v_decremento_bin, 'v_cuota_dec:', v_cuota_dec, 'v_ultSaldo_dec:', v_ultSaldo_dec, 'numIter', numIter);
    if (v_decremento_bin > (v_cuota_base / 50) & v_int_anual > 0.50) {
        v_decremento_bin = Math.round((v_cuota_base / 50) * 100) / 100;
    }
    // console.log('Despues: v_decremento_bin:', v_decremento_bin, 'v_cuota_dec:', v_cuota_dec, 'v_ultSaldo_dec:', v_ultSaldo_dec, 'numIter', numIter);

    if (v_ultSaldo_dec < 0) {
        numIter = 0;
        while (v_ultSaldo_dec < 0 && v_cuota_dec > 0 && numIter < v_limiteIteraciones) { //&& v_cuota_dec > v_cuo_0 * 0.5
            v_cuota_dec = Math.round((v_cuota_dec - v_decremento_bin) * 100) / 100;
            v_ultSaldo_dec = saldoUltCuota(v_montoIni, v_numCuotaIni, v_numCuotasTotal, v_int_anual, v_cuota_dec, v_abonarCuota1, v_diasCobro);
            // console.log(numIter, ': v_ultSaldo_dec', v_ultSaldo_dec, 'v_cuota_dec', v_cuota_dec);
            numIter = numIter + 1;
        }
    }
    // console.log('v_cuota_dec:', v_cuota_dec, 'v_ultSaldo_dec:', v_ultSaldo_dec, 'numIter', numIter);

    // Se realiza la búsqueda binaria para determinar la cuota correcta
    let aux_intervalo = Math.round(v_cuota_base - v_cuota_dec);

    // console.log('----------Se realiza la búsqueda binaria para determinar la cuota correcta');
    // console.log('inter:', aux_intervalo, 'cuo_dec:', v_cuota_dec, 'cuo_base:', v_cuota_base, ' ; ult_dec:', v_ultSaldo_dec, 'ult_base:', v_ultSaldo_base);

    let aux_cuo = v_cuota_dec;
    numIter = 0;
    while (aux_intervalo > v_binCuota_precision && aux_intervalo > 0 && aux_cuo > 0 && numIter < v_limiteIteraciones) {
        aux_intervalo = Math.round(((v_cuota_base - v_cuota_dec) / 2) * 100) / 100;
        aux_cuo = Math.round((v_cuota_dec + aux_intervalo) * 100) / 100;
        const aux_ult = saldoUltCuota(v_montoIni, v_numCuotaIni, v_numCuotasTotal, v_int_anual, aux_cuo, v_abonarCuota1, v_diasCobro);
        v_cuota_base = aux_ult < 0 ? aux_cuo : v_cuota_base;
        v_ultSaldo_base = aux_ult < 0 ? aux_ult : v_ultSaldo_base;
        v_cuota_dec = aux_ult >= 0 ? aux_cuo : v_cuota_dec;
        v_ultSaldo_dec = aux_ult >= 0 ? aux_ult : v_ultSaldo_dec;
        numIter = numIter + 1;
        // console.log('inter:', aux_intervalo, 'cuo_dec:', v_cuota_dec, 'cuo_base:', v_cuota_base, ' ; ult_dec:', v_ultSaldo_dec, 'ult_base:', v_ultSaldo_base);
    }
    return v_cuota_dec;
};


// ------------- Construcción de la cuota de transición -------------
const construccionCuotaTransicion = (v_nroCuotaTransicion, v_numCuotasTotal, v_diasCobro, v_fechasPago, v_fechaRevTasa, v_interes1, v_interes2, v_pp1) => {
    //if (v_nroCuotaTransicion > 1 && v_nroCuotaTransicion < v_numCuotasTotal) {
    if (v_nroCuotaTransicion >= 1 && v_nroCuotaTransicion <= v_numCuotasTotal) {
        // Identificacion de los datos iniciales de la cuota de transicion
        const tra_nroDias = v_diasCobro[v_nroCuotaTransicion - 1];
        const tra_saldoAnt = v_pp1[v_nroCuotaTransicion - 2][4];
        const tra_capital = v_pp1[v_nroCuotaTransicion - 1][2];
        const tra_saldoNue = Math.round((tra_saldoAnt - tra_capital) * 100) / 100;
        // console.log('tra_nroDias', tra_nroDias);
        // console.log('tra_saldoAnt', tra_saldoAnt);
        // console.log('tra_capital', tra_capital);
        // console.log('tra_saldoNue', tra_saldoNue);

        // Construcción del interés compuesto a cobrar
        const tra_fechaInteres0 = v_fechasPago[v_nroCuotaTransicion - 2];
        const tra_fechaInteres1 = v_fechaRevTasa;
        const tra_fechaInteres2 = v_fechasPago[v_nroCuotaTransicion - 1];
        // console.log('tra_fechaInteres0', tra_fechaInteres0);
        // console.log('tra_fechaInteres1', tra_fechaInteres1);
        // console.log('tra_fechaInteres2', tra_fechaInteres2);

        const tra_numDiasInteres1 = Math.round((tra_fechaInteres1.getTime() - tra_fechaInteres0.getTime()) / (1000 * 3600 * 24));
        const tra_numDiasInteres2 = Math.round((tra_fechaInteres2.getTime() - tra_fechaInteres1.getTime()) / (1000 * 3600 * 24));
        // console.log('tra_numDiasInteres1', tra_numDiasInteres1);
        // console.log('tra_numDiasInteres2', tra_numDiasInteres2);

        const tra_interes1 = Math.round((v_interes1 / 360) * tra_numDiasInteres1 * tra_saldoAnt * 100) / 100;
        const tra_interes2 = Math.round((v_interes2 / 360) * tra_numDiasInteres2 * tra_saldoAnt * 100) / 100;
        const tra_interes = Math.round((tra_interes1 + tra_interes2) * 100) / 100;
        // console.log('tra_interes1', tra_interes1);
        // console.log('tra_interes2', tra_interes2);
        // console.log('tra_interes', tra_interes);

        const resultado = [tra_nroDias, tra_interes, tra_capital, tra_saldoAnt, tra_saldoNue];
        // console.log(resultado);

        return resultado;
    }
};


// ------------- Generacion del plan de pagos -------------

const generaPlanPagos = (
    v_numCuotas, v_nroCuotasFija, v_fechaDesembolso, v_diaPago, v_interes1, v_interes2, v_seguro,
    v_monto
) => {
    // Identificación de parámetros a partir de las variables de entrada
    const v_fechaIni = new Date(v_fechaDesembolso.split('/')[2], v_fechaDesembolso.split('/')[1] - 1, v_fechaDesembolso.split('/')[0]);

    v_fechaRevTasa = new Date(v_fechaIni.valueOf());
    v_fechaRevTasa.setDate(v_fechaRevTasa.getDate() + (v_nroCuotasFija * 30));
    v_feriados = ['01/01', '22/01', '01/05', '21/06', '02/11', '25/12'];
    const v_limiteIteraciones = 100;
    const v_binCuota_precision = 0.01;
    const v_binCuota_porcentIntervalo = 0.10;
    // const v_binCuota_porcentIntervalo = 0.01;

    // Llamada a la función base para generar el plan de pagos
    const v_pp = generaPlanPagos_base(
        v_numCuotas, v_nroCuotasFija, v_diaPago, v_interes1, v_interes2, v_seguro,
        v_monto,
        v_fechaIni, v_fechaRevTasa, v_feriados, v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo
    );

    // console.log('v_pp', v_pp);
    // conversión del plan de pagos en un objeto Json
    let res_array = [];
    for (i = 0; i < v_pp.length; i++) {
        res_array.push({
            cuota: i + 1,
            fechaVenc: v_pp[i][7].toLocaleDateString('en-GB'),
            saldoCapital: v_pp[i][3],
            capital: v_pp[i][2],
            interes: v_pp[i][1],
            capitalMasInt: Math.round((v_pp[i][2] + v_pp[i][1]) * 100) / 100,
            seguro: v_pp[i][5],
            cuotaFinal: v_pp[i][6]
        });
    }

    return JSON.parse(JSON.stringify({ planPago: res_array }));

};

const generaPlanPagos_base = (
    v_numCuotas, v_nroCuotasFija, v_diaPago, v_interes1, v_interes2, v_seguro,
    v_monto,
    v_fechaIni, v_fechaRevTasa, v_feriados, v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo
) => {
    // Se construye el primer plan de pagos
    let resultado = [];
    p_fechaIni = new Date(v_fechaIni.valueOf());

    // Preparación de las variables del proceso
    const fechasFeriado = generarListaFeriados(p_fechaIni, v_numCuotas, v_feriados);
    const fechasPago = identificarFechasPago(p_fechaIni, v_numCuotas, fechasFeriado, v_diaPago);
    const diasCobro = identificarDiasCobro(p_fechaIni, fechasPago, v_numCuotas);
    const nroCuotaTransicion = identificarCuotaTransicion(v_nroCuotasFija, v_numCuotas, fechasPago, v_fechaRevTasa);
    // const abonarCapitalCuota1 = identificarAbonoCuota1(nroCuotaTransicion, v_nroCuotasFija, v_numCuotas);
    const abonarCapitalCuota1 = identificarAbonoCuota1(p_fechaIni, fechasPago);

    // console.log('--nroCuotaTransicion', nroCuotaTransicion);
    // console.log('--abonarCapitalCuota1', abonarCapitalCuota1);
    // console.log('--v_fechaRevTasa', v_fechaRevTasa);

    if (nroCuotaTransicion > 1) {
        if (nroCuotaTransicion <= v_numCuotas) {
            // console.log('--aplica los 2 PP');
            // Aplicar los 2 Planes de pago

            // Plan de pagos 1 (si corresponde)
            const cuota1 = determinacionCuota(v_monto, 1, v_numCuotas, v_interes1, abonarCapitalCuota1, diasCobro, v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo);
            const pp1 = planPagos(v_monto, 1, v_numCuotas, v_interes1, cuota1, abonarCapitalCuota1, diasCobro);

            // Cuota de transición
            const tra = construccionCuotaTransicion(nroCuotaTransicion, v_numCuotas, diasCobro, fechasPago, v_fechaRevTasa, v_interes1, v_interes2, pp1);
            // console.log('tra', tra);

            // Plan de pagos 2
            if (nroCuotaTransicion < v_numCuotas) {
                // console.log('----------- Inicio de la determinación de la Cuota Base 2 --------------');
                // console.log('monto =', tra[4], ' ; nroCuotaIni =', nroCuotaTransicion + 1, ' ; v_numCuotas =', v_numCuotas, ' ; v_interes2 =', v_interes2, ' ; v_limiteIteraciones =', v_limiteIteraciones, ' ; v_binCuota_precision =', v_binCuota_precision, ' ; v_binCuota_porcentIntervalo =', v_binCuota_porcentIntervalo);
                const cuota2 = determinacionCuota(tra[4], nroCuotaTransicion + 1, v_numCuotas, v_interes2, true, diasCobro, v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo);
                // console.log('cuota2 =', cuota2);
                // console.log('----------- Fin de la determinación de la Cuota Base 2 --------------');

                const pp2 = planPagos(tra[4], nroCuotaTransicion + 1, v_numCuotas, v_interes2, cuota2, true, diasCobro);
                // Resultado combinado
                resultado = pp1.slice(0, nroCuotaTransicion - 1).concat([tra]).concat(pp2);
            } else {
                // Resultado combinado
                resultado = pp1.slice(0, nroCuotaTransicion - 1).concat([tra]);
            }

        } else {
            // console.log('--solo aplica el PP1');
            // Aplicar solo el Plan de pagos 1
            const cuota1 = determinacionCuota(v_monto, 1, v_numCuotas, v_interes1, abonarCapitalCuota1, diasCobro, v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo);
            const pp1 = planPagos(v_monto, 1, v_numCuotas, v_interes1, cuota1, abonarCapitalCuota1, diasCobro);
            resultado = pp1;
        }
    } else {
        // console.log('--solo aplica el PP2');
        // Solo Plan de pagos 2
        const cuota2 = determinacionCuota(v_monto, 1, v_numCuotas, v_interes2, abonarCapitalCuota1, diasCobro, v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo);
        const pp2 = planPagos(v_monto, 1, v_numCuotas, v_interes2, cuota2, abonarCapitalCuota1, diasCobro);
        resultado = pp2;
    }

    // Ajuste el saldo de la última cuota
    if (resultado[resultado.length - 1][4] > 0) {
        resultado[resultado.length - 1][2] = Math.round((resultado[resultado.length - 1][2] + resultado[resultado.length - 1][4]) * 100) / 100;
        resultado[resultado.length - 1][4] = 0;
    }
    // Adición del Seguro, Cuota final y fecha
    const tasaSeguroDia = v_seguro / 360;
    for (i = 0; i < resultado.length; i++) {
        const numDiasSiguiente = (i < resultado.length - 1) ? resultado[i + 1][0] : 0;
        const interes = resultado[i][1];
        const capital = resultado[i][2];
        const saldoAnt = resultado[i][3];
        const seguro = Math.round(numDiasSiguiente * tasaSeguroDia * saldoAnt * 100) / 100;
        const cuotaFinal = Math.round((interes + capital + seguro) * 100) / 100;
        resultado[i] = resultado[i].concat(seguro).concat(cuotaFinal).concat(fechasPago[i]);
    }

    return resultado;
};

const identificarCuotaMasAlta = (
    v_numCuotas, v_nroCuotasFija, v_fechaDesembolso, v_diaPago, v_interes1, v_interes2, v_seguro,
    v_monto) => {
    // Identificación de parámetros a partir de las variables de entrada
    v_fechaIni = new Date(v_fechaDesembolso.split('/')[2], v_fechaDesembolso.split('/')[1] - 1, v_fechaDesembolso.split('/')[0]);
    v_fechaRevTasa = new Date(v_fechaIni.valueOf());
    v_fechaRevTasa.setDate(v_fechaRevTasa.getDate() + (v_nroCuotasFija * 30));
    v_feriados = ['01/01', '22/01', '01/05', '21/06', '02/11', '25/12'];
    const v_limiteIteraciones = 100;
    const v_binCuota_precision = 0.01;
    const v_binCuota_porcentIntervalo = 0.10;
    // const v_binMonto_presicion = 0.01;
    // const v_binMonto_porcentIntervalo = 0.10;

    // A partir de los datos de entrada se genera el plan de pagos
    const v_pp = generaPlanPagos_base(
        v_numCuotas, v_nroCuotasFija, v_diaPago, v_interes1, v_interes2, v_seguro,
        v_monto,
        v_fechaIni, v_fechaRevTasa, v_feriados, v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo);

    // Con el plan de pagos se identifica la cuota más alta
    const resultado = identificarCuotaMasAlta_base(v_pp);

    // return { cuotaMax: resultado };
    return JSON.parse(JSON.stringify({ cuotaMax: resultado }));
};
const identificarCuotaMasAlta_base = (v_pp) => {
    let resultado = 0;
    for (i = 0; i < v_pp.length; i++) {
        if (v_pp[i][6] > resultado) {
            resultado = v_pp[i][6];
        }
    }
    return resultado;
};



const cuotaMasAlta = (v_monto, v_numCuotas, v_nroCuotasFija, v_fechaIni, v_fechaRevTasa, v_diaPago, v_feriados, v_interes1, v_interes2, v_seguro, v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo) => {
    p_fechaIni = new Date(v_fechaIni.valueOf());
    const pp = generaPlanPagos_base(
        v_numCuotas, v_nroCuotasFija, v_diaPago, v_interes1, v_interes2, v_seguro,
        v_monto,
        p_fechaIni, v_fechaRevTasa, v_feriados, v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo);
    const cuo = identificarCuotaMasAlta_base(pp);
    return cuo;
};

const buscarMontoPorCuota = (
    v_numCuotas, v_nroCuotasFija, v_fechaDesembolso, v_diaPago, v_interes1, v_interes2, v_seguro,
    v_cuotaMax
) => {
    // console.log('v_fechaDesembolso', v_fechaDesembolso);
    // Identificación de parámetros a partir de las variables de entrada
    const v_fechaIni = new Date(v_fechaDesembolso.split('/')[2], v_fechaDesembolso.split('/')[1] - 1, v_fechaDesembolso.split('/')[0]);
    // console.log('1.- v_numCuotas =', v_numCuotas, ' ; v_nroCuotasFija =', v_nroCuotasFija, ' ; v_fechaIni =', v_fechaIni, ' ; v_fechaDesembolso =', v_fechaDesembolso, ' ; v_diaPago =', v_diaPago, ' ; v_interes1 =', v_interes1, ' ; v_interes2 =', v_interes2, ' ; v_seguro =', v_seguro);

    const v_fechaRevTasa = new Date(v_fechaIni.valueOf());
    v_fechaRevTasa.setDate(v_fechaRevTasa.getDate() + (v_nroCuotasFija * 30));
    const v_feriados = ['01/01', '22/01', '01/05', '21/06', '02/11', '25/12'];
    const v_limiteIteraciones = 100;
    const v_binCuota_precision = 0.01;
    const v_binCuota_porcentIntervalo = 0.10;
    const v_binMonto_presicion = 0.01;
    const v_binMonto_porcentIntervalo = 0.10;
    // console.log('2.- v_numCuotas =', v_numCuotas, ' ; v_nroCuotasFija =', v_nroCuotasFija, ' ; v_fechaIni =', v_fechaIni, ' ; v_fechaRevTasa =', v_fechaRevTasa, ' ; v_diaPago =', v_diaPago, ' ; v_interes1 =', v_interes1, ' ; v_interes2 =', v_interes2, ' ; v_seguro =', v_seguro);

    // // Se identifica el monto de que conduce a una cuota que no supere la v_cuotaMax
    // console.clear();
    // console.log('v_cuotaMax:', v_cuotaMax);

    // Monto base
    // console.log('v_fechaIni antes del monto base', v_fechaIni);
    // console.log('3.- v_numCuotas =', v_numCuotas, ' ; v_nroCuotasFija =', v_nroCuotasFija, ' ; v_fechaIni =', v_fechaIni, ' ; v_fechaRevTasa =', v_fechaRevTasa, ' ; v_diaPago =', v_diaPago, ' ; v_interes1 =', v_interes1, ' ; v_interes2 =', v_interes2, ' ; v_seguro =', v_seguro);
    const v_monto_0 = v_cuotaMax * v_numCuotas;
    const v_cuota_0 = cuotaMasAlta(v_monto_0, v_numCuotas, v_nroCuotasFija, v_fechaIni, v_fechaRevTasa, v_diaPago, v_feriados, v_interes1, v_interes2, v_seguro, v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo);
    // console.log('v_fechaIni despues del monto base', v_fechaIni);
    // console.log('4.- v_numCuotas =', v_numCuotas, ' ; v_nroCuotasFija =', v_nroCuotasFija, ' ; v_fechaIni =', v_fechaIni, ' ; v_fechaRevTasa =', v_fechaRevTasa, ' ; v_diaPago =', v_diaPago, ' ; v_interes1 =', v_interes1, ' ; v_interes2 =', v_interes2, ' ; v_seguro =', v_seguro);

    // Se verifica que se inicia en una cuota mayor a la cuota máxima definida
    // console.log('Se verifica que se inicia en una cuota mayor a la cuota máxima definida');
    const v_incremento_base = Math.round(v_monto_0 * v_binMonto_porcentIntervalo * 100) / 100;
    let v_monto_base = v_monto_0;
    let v_cuota_base = v_cuota_0;
    let numIter = 0;
    if (v_cuota_base < v_cuotaMax) {
        numIter = 0;
        while (v_cuota_base < v_cuotaMax && v_cuota_base > 0 && v_monto_base > 0 && numIter < v_limiteIteraciones) { //&& v_monto_base < v_monto_0 * 1.5
            v_monto_base = Math.round((v_monto_base + v_incremento_base) * 100) / 100;
            v_cuota_base = cuotaMasAlta(v_monto_base, v_numCuotas, v_nroCuotasFija, v_fechaIni, v_fechaRevTasa, v_diaPago, v_feriados, v_interes1, v_interes2, v_seguro, v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo);
            numIter = numIter + 1;
            // console.log('numIter:', numIter, 'v_monto_base:', v_monto_base, 'v_cuota_base:', v_cuota_base);
            // console.log('5.- v_monto_base = ', v_monto_base, ' ; v_numCuotas =', v_numCuotas, ' ; v_nroCuotasFija =', v_nroCuotasFija, ' ; v_fechaIni =', v_fechaIni, ' ; v_fechaRevTasa =', v_fechaRevTasa, ' ; v_diaPago =', v_diaPago, ' ; v_interes1 =', v_interes1, ' ; v_interes2 =', v_interes2, ' ; v_seguro =', v_seguro);

        }
    }
    // console.log('numIter:', numIter, 'v_monto_base:', v_monto_base, 'v_cuota_base:', v_cuota_base);

    // Se identifica el rango para una búsqueda binaria
    // console.log('Se identifica el rango para una búsqueda binaria');
    const v_decremento_bin = Math.round(v_monto_base * v_binMonto_porcentIntervalo * 100) / 100;
    let v_monto_dec = v_monto_base;
    let v_cuota_dec = v_cuota_base;
    if (v_cuota_dec > v_cuotaMax) {
        numIter = 0;
        while (v_cuota_dec > v_cuotaMax && v_cuota_dec > 0 && v_monto_dec > 0 && numIter < v_limiteIteraciones) { //&& v_cuota_dec > v_monto_0 * 0.5
            v_monto_dec = Math.round((v_monto_dec - v_decremento_bin) * 100) / 100;
            v_cuota_dec = cuotaMasAlta(v_monto_dec, v_numCuotas, v_nroCuotasFija, v_fechaIni, v_fechaRevTasa, v_diaPago, v_feriados, v_interes1, v_interes2, v_seguro, v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo);
            numIter = numIter + 1;
            // console.log('numIter:', numIter, 'v_monto_dec:', v_monto_dec, 'v_cuota_dec:', v_cuota_dec);
            // console.log('6.- v_monto_dec = ', v_monto_dec, ' ; v_numCuotas =', v_numCuotas, ' ; v_nroCuotasFija =', v_nroCuotasFija, ' ; v_fechaIni =', v_fechaIni, ' ; v_fechaRevTasa =', v_fechaRevTasa, ' ; v_diaPago =', v_diaPago, ' ; v_interes1 =', v_interes1, ' ; v_interes2 =', v_interes2, ' ; v_seguro =', v_seguro);
        }
    }
    // console.log('numIter:', numIter, 'v_monto_dec:', v_monto_dec, 'v_cuota_dec:', v_cuota_dec);

    // // Se realiza la búsqueda binaria para determinar la cuota correcta
    // console.log('Se realiza la búsqueda binaria para determinar la cuota correcta');
    // console.log('-------------');
    // console.log('v_numCuotas', v_numCuotas);
    // console.log('v_nroCuotasFija', v_nroCuotasFija);
    // console.log('v_fechaIni', v_fechaIni);
    // console.log('v_fechaRevTasa', v_fechaRevTasa);
    // console.log('v_diaPago', v_diaPago);
    // console.log('v_feriados', v_feriados);
    // console.log('v_interes1', v_interes1);
    // console.log('v_interes2', v_interes2);
    // console.log('v_seguro', v_seguro);
    // // v_numCuotas, v_nroCuotasFija, v_fechaIni, v_fechaRevTasa, v_diaPago, v_feriados, v_interes1, v_interes2, v_seguro
    // console.log('-------------');

    let aux_intervalo = Math.round(v_monto_base - v_cuota_dec);
    if (aux_intervalo > v_binMonto_presicion) {
        let aux_monto = v_monto_dec;
        let aux_cuota = v_cuota_dec;
        numIter = 0;
        while (aux_intervalo > v_binMonto_presicion && aux_monto > 0 && aux_cuota > 0 && numIter < v_limiteIteraciones) {
            aux_intervalo = Math.round(((v_monto_base - v_monto_dec) / 2) * 100) / 100;
            aux_monto = Math.round((v_monto_dec + aux_intervalo) * 100) / 100;
            aux_cuota = cuotaMasAlta(aux_monto, v_numCuotas, v_nroCuotasFija, v_fechaIni, v_fechaRevTasa, v_diaPago, v_feriados, v_interes1, v_interes2, v_seguro, v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo);
            v_monto_base = aux_cuota > v_cuotaMax ? aux_monto : v_monto_base;
            v_cuota_base = aux_cuota > v_cuotaMax ? aux_cuota : v_cuota_base;

            v_monto_dec = aux_cuota <= v_cuotaMax ? aux_monto : v_monto_dec;
            v_cuota_dec = aux_cuota <= v_cuotaMax ? aux_cuota : v_cuota_dec;
            numIter = numIter + 1;
            // console.log('numIter:', numIter, 'intervalo:', aux_intervalo, 'v_monto_dec:', v_monto_dec, 'v_cuota_dec:', v_cuota_dec, ' ; v_monto_base:', v_monto_base, 'v_cuota_base:', v_cuota_base);
            // console.log('7.- v_monto_dec = ', v_monto_dec, ' ; v_numCuotas =', v_numCuotas, ' ; v_nroCuotasFija =', v_nroCuotasFija, ' ; v_fechaIni =', v_fechaIni, ' ; v_fechaRevTasa =', v_fechaRevTasa, ' ; v_diaPago =', v_diaPago, ' ; v_interes1 =', v_interes1, ' ; v_interes2 =', v_interes2, ' ; v_seguro =', v_seguro);
        }
    }
    // console.log('numIter:', numIter, 'intervalo:', aux_intervalo, 'v_monto_dec:', v_monto_dec, 'v_cuota_dec:', v_cuota_dec, ' ; v_monto_base:', v_monto_base, 'v_cuota_base:', v_cuota_base);

    //return v_monto_dec;
    // return { monto: v_monto_dec };
    return JSON.parse(JSON.stringify({ monto: v_monto_dec }));

};

module.exports = {
    generaPlanPagos,
    identificarCuotaMasAlta,
    buscarMontoPorCuota
};
// module.exports = cuotaMasAlta;