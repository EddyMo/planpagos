// Identificación de parámetros
const generaParametros = (v_param, v_fechaDesembolso, v_nroCuotasFija) => {

    const v_fechaIni = new Date(v_fechaDesembolso.split('/')[2], v_fechaDesembolso.split('/')[1] - 1, v_fechaDesembolso.split('/')[0]);
    const v_fechaRevTasa = new Date(v_fechaIni.valueOf());
    v_fechaRevTasa.setDate(v_fechaRevTasa.getDate() + (v_nroCuotasFija * 30));
    const resultado = {
        fechaIni: v_fechaIni,
        fechaRevTasa: v_fechaRevTasa,
        feriados: v_param.feriados,
        limiteIteraciones: v_param.limiteIteraciones,
        binCuota_precision: v_param.binCuota_precision,
        binCuota_porcentIntervalo: v_param.binCuota_porcentIntervalo,
        binMonto_presicion: v_param.binMonto_presicion,
        binMonto_porcentIntervalo: v_param.binMonto_porcentIntervalo
    };
    return resultado;
};


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
        let capital = (numCuota === 1 & v_abonarCuota1 === false) || v_monto_cuota < interes ? 0 : Math.round((v_monto_cuota - interes) * 100) / 100;
        if (capital > v_saldo) {
            capital = v_saldo;
        }
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

    // console.log('v_numCuotaIni', v_numCuotaIni, 'v_num_cuotas', v_num_cuotas, 'v_montoIni', v_montoIni, 'v_monto_cuota', v_monto_cuota);
    for (numCuota = v_numCuotaIni; numCuota <= v_num_cuotas; numCuota++) {
        const interes = Math.round(v_diasCobro[numCuota - 1] * v_int_dia * v_saldo * 100) / 100;
        let capital = numCuota == 1 & v_abonarCuota1 == false ? 0 : Math.round((v_monto_cuota - interes) * 100) / 100;
        if (capital < 0) {
            capital = 0;
        }
        // let capital = (numCuota === 1 & v_abonarCuota1 === false) || v_monto_cuota < interes ? 0 : Math.round((v_monto_cuota - interes) * 100) / 100;
        // if (capital > v_saldo) {
        //     capital = v_saldo;
        // }
        const saldo_ant = v_saldo;
        const saldo_nue = Math.round((saldo_ant - capital) * 100) / 100;
        v_saldo = saldo_nue;
        if (numCuota == v_num_cuotas) {
            resultado = saldo_nue;
        }
        // if (numCuota >= v_num_cuotas - 5) { // || numCuota <= 8
        //     console.log('cuo:', numCuota, 'interes', interes, 'capital', capital, 'saldo_ant', saldo_ant, 'saldo_nue', saldo_nue);
        // }
    }
    return resultado;
};


// ------------- Identificación de la cuota mensual correcta -------------
const determinacionCuota = (v_montoIni, v_numCuotaIni, v_numCuotasTotal, v_int_anual, v_abonarCuota1, v_diasCobro,
    v_param //v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo
) => {
    // Identificación del número de cuotas
    v_num_cuotas = v_numCuotasTotal - v_numCuotaIni + 1;

    // console.log('v_montoIni', v_montoIni);
    // console.log('v_numCuotaIni', v_numCuotaIni);
    // console.log('v_numCuotasTotal', v_numCuotasTotal);
    // console.log('v_int_anual', v_int_anual);
    // console.log('v_abonarCuota1', v_abonarCuota1);
    // console.log('v_num_cuotas', v_num_cuotas);

    // Cuota inicial
    const v_cuo_0 = cuotaMensualBase(v_montoIni, v_num_cuotas, v_int_anual);
    const v_ult_0 = saldoUltCuota(v_montoIni, v_numCuotaIni, v_numCuotasTotal, v_int_anual, v_cuo_0, v_abonarCuota1, v_diasCobro);
    // console.log('v_cuo_0:', v_cuo_0, 'v_ult_0:', v_ult_0);

    // Se verifica que se inicia en un saldo negativo (de la última cuota)
    const v_incremento_base = Math.round(v_cuo_0 * v_param.binCuota_porcentIntervalo * 100) / 100; //v_binCuota_porcentIntervalo
    let v_cuota_base = v_cuo_0;
    let v_ultSaldo_base = v_ult_0;
    let numIter = 0;
    if (v_ultSaldo_base > 0) {
        numIter = 0;
        while (v_ultSaldo_base > 0 && v_cuota_base > 0 && numIter < v_param.limiteIteraciones) { //&& v_cuota_base < v_cuo_0 * 1.5 // v_limiteIteraciones
            v_cuota_base = Math.round((v_cuota_base + v_incremento_base) * 100) / 100;
            v_ultSaldo_base = saldoUltCuota(v_montoIni, v_numCuotaIni, v_numCuotasTotal, v_int_anual, v_cuota_base, v_abonarCuota1, v_diasCobro);
            numIter = numIter + 1;
        }
    }
    // console.log('v_cuota_base:', v_cuota_base, 'v_ultSaldo_base NEGATIVO:', v_ultSaldo_base);

    // Se identifica el rango para una búsqueda binaria
    // console.log('----------Se identifica el rango para una búsqueda binaria');
    let v_decremento_bin = Math.round(v_cuo_0 * v_param.binCuota_porcentIntervalo * 100) / 100; //v_binCuota_porcentIntervalo
    let v_cuota_dec = v_cuota_base;
    let v_ultSaldo_dec = v_ultSaldo_base;
    v_cuota_dec = 0.01;

    // Se realiza la búsqueda binaria para determinar la cuota correcta
    let aux_intervalo = Math.round(v_cuota_base - v_cuota_dec);

    // console.log('----------Se realiza la búsqueda binaria para determinar la cuota correcta');
    // console.log('inter:', aux_intervalo, 'cuo_dec:', v_cuota_dec, 'cuo_base:', v_cuota_base, ' ; ult_dec:', v_ultSaldo_dec, 'ult_base:', v_ultSaldo_base);

    let aux_cuo = v_cuota_dec;
    let aux_cuota_final = 0;
    let efecto_1_centavo_en_capital = Math.round(v_num_cuotas) / 100;
    numIter = 0;

    while (aux_intervalo >= v_param.binCuota_precision && aux_intervalo > 0 && aux_cuo > 0 && numIter < v_param.limiteIteraciones) { //v_limiteIteraciones //v_binCuota_precision
        aux_intervalo = Math.round(((v_cuota_base - v_cuota_dec) / 3) * 100) / 100;
        aux_cuo = Math.round((v_cuota_dec + aux_intervalo) * 100) / 100;
        const aux_ult = saldoUltCuota(v_montoIni, v_numCuotaIni, v_numCuotasTotal, v_int_anual, aux_cuo, v_abonarCuota1, v_diasCobro);
        v_cuota_base = aux_ult < 0 ? aux_cuo : v_cuota_base;
        v_ultSaldo_base = aux_ult < 0 ? aux_ult : v_ultSaldo_base;
        v_cuota_dec = aux_ult >= 0 ? aux_cuo : v_cuota_dec;
        v_ultSaldo_dec = aux_ult >= 0 ? aux_ult : v_ultSaldo_dec;
        numIter = numIter + 1;

        aux_cuota_final = v_ultSaldo_dec >= efecto_1_centavo_en_capital ? v_cuota_base : v_cuota_dec;
        // console.log('inter:', aux_intervalo, ' ; cuo_dec:', v_cuota_dec, ' ; cuo_base:', v_cuota_base, ' ; ult_dec:', v_ultSaldo_dec, ' ; ult_base:', v_ultSaldo_base, ' ; aux_cuota_final:', aux_cuota_final);
    }
    // console.log('resultado final', v_cuota_dec);
    // return v_cuota_dec;

    // console.log('efecto_1_centavo_en_capital', efecto_1_centavo_en_capital);
    // console.log('resultado final', aux_cuota_final);
    return aux_cuota_final;
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


// ------------- *** Generacion del plan de pagos -------------
const generaPlanPagos = (v_input, p_param) => {
    // console.log('p_param en generaPlanPagos', p_param);
    v_numCuotas = v_input.numCuotas;
    v_nroCuotasFija = v_input.nroCuotasFija;
    v_fechaDesembolso = v_input.fechaDesembolso;
    v_diaPago = v_input.diaPago;
    v_interes1 = v_input.interes1;
    v_interes2 = v_input.interes2;
    v_seguro = v_input.seguro;
    v_sepelio = v_input.sepelio;
    v_monto = v_input.monto;

    // Parámetros
    const v_param = generaParametros(p_param, v_fechaDesembolso, v_nroCuotasFija);

    // Llamada a la función base para generar el plan de pagos
    const v_pp = generaPlanPagos_base(
        v_numCuotas, v_nroCuotasFija, v_diaPago, v_interes1, v_interes2, v_seguro, v_sepelio,
        v_monto, v_param
        //_fechaIni, v_fechaRevTasa, v_feriados, v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo
    );

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
    // // Adicion de totales
    // const v_totales = totalesPlanPagos_base(v_pp);
    // res_array.push(v_totales);

    return JSON.parse(JSON.stringify({ planPago: res_array }));

};
const generaPlanPagos_base = (
    v_numCuotas, v_nroCuotasFija, v_diaPago, v_interes1, v_interes2, v_seguro, v_sepelio,
    v_monto, v_param
    //v_fechaIni, v_fechaRevTasa, v_feriados, v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo
) => {
    // Se construye el primer plan de pagos
    let resultado = [];
    p_fechaIni = new Date(v_param.fechaIni.valueOf()); //p_fechaIni = new Date( v_fechaIni.valueOf());

    // Preparación de las variables del proceso
    const fechasFeriado = generarListaFeriados(p_fechaIni, v_numCuotas, v_param.feriados); //  v_feriados
    const fechasPago = identificarFechasPago(p_fechaIni, v_numCuotas, fechasFeriado, v_diaPago);
    const diasCobro = identificarDiasCobro(p_fechaIni, fechasPago, v_numCuotas);
    const nroCuotaTransicion = identificarCuotaTransicion(v_nroCuotasFija, v_numCuotas, fechasPago, v_param.fechaRevTasa); //v_fechaRevTasa
    // const abonarCapitalCuota1 = identificarAbonoCuota1(nroCuotaTransicion, v_nroCuotasFija, v_numCuotas);
    const abonarCapitalCuota1 = identificarAbonoCuota1(p_fechaIni, fechasPago);

    // console.log('--nroCuotaTransicion', nroCuotaTransicion);
    // console.log('--abonarCapitalCuota1', abonarCapitalCuota1);
    // console.log('--v_fechaRevTasa', v_fechaRevTasa);

    if (nroCuotaTransicion > 1) {
        if (nroCuotaTransicion <= v_numCuotas & v_nroCuotasFija < v_numCuotas) {
            // console.log('--aplica los 2 PP');
            // Aplicar los 2 Planes de pago

            // Plan de pagos 1 (si corresponde)
            // console.log('--------------- INICIA Primer plan de pagos ---------------');
            const cuota1 = determinacionCuota(v_monto, 1, v_numCuotas, v_interes1, abonarCapitalCuota1, diasCobro, v_param); // v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo //v_param.limiteIteraciones, v_param.binCuota_precision, v_param.binCuota_porcentIntervalo
            const pp1 = planPagos(v_monto, 1, v_numCuotas, v_interes1, cuota1, abonarCapitalCuota1, diasCobro);
            // console.log('--------------- TERMINA Primer plan de pagos ---------------');

            // Cuota de transición
            const tra = construccionCuotaTransicion(nroCuotaTransicion, v_numCuotas, diasCobro, fechasPago, v_param.fechaRevTasa, v_interes1, v_interes2, pp1); //  v_fechaRevTasa
            // console.log('tra', tra);

            // Plan de pagos 2
            if (nroCuotaTransicion < v_numCuotas) {
                // console.log('----------- Inicio de la determinación de la Cuota Base 2 --------------');
                // console.log('monto =', tra[4], ' ; nroCuotaIni =', nroCuotaTransicion + 1, ' ; v_numCuotas =', v_numCuotas, ' ; v_interes2 =', v_interes2, ' ; v_limiteIteraciones =', v_limiteIteraciones, ' ; v_binCuota_precision =', v_binCuota_precision, ' ; v_binCuota_porcentIntervalo =', v_binCuota_porcentIntervalo);
                const cuota2 = determinacionCuota(tra[4], nroCuotaTransicion + 1, v_numCuotas, v_interes2, true, diasCobro, v_param); // v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo //v_param.limiteIteraciones, v_param.binCuota_precision, v_param.binCuota_porcentIntervalo
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
            const cuota1 = determinacionCuota(v_monto, 1, v_numCuotas, v_interes1, abonarCapitalCuota1, diasCobro, v_param); //v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo //v_param.limiteIteraciones, v_param.binCuota_precision, v_param.binCuota_porcentIntervalo
            const pp1 = planPagos(v_monto, 1, v_numCuotas, v_interes1, cuota1, abonarCapitalCuota1, diasCobro);
            resultado = pp1;
        }
    } else {
        // console.log('--solo aplica el PP2');
        // Solo Plan de pagos 2
        const cuota2 = determinacionCuota(v_monto, 1, v_numCuotas, v_interes2, abonarCapitalCuota1, diasCobro, v_param); //v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo //v_param.limiteIteraciones, v_param.binCuota_precision, v_param.binCuota_porcentIntervalo
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
        const seguro = Math.round(((numDiasSiguiente * tasaSeguroDia * saldoAnt) + ((i < resultado.length - 1) ? v_sepelio : 0)) * 100) / 100;
        const cuotaFinal = Math.round((interes + capital + seguro) * 100) / 100;
        resultado[i] = resultado[i].concat(seguro).concat(cuotaFinal).concat(fechasPago[i]);
    }
    return resultado;
};

// ------------- Identificación de la cuota más alta (para funciones internas) -------------
const cuotaMasAlta = (v_monto, v_numCuotas, v_nroCuotasFija, v_diaPago, v_interes1, v_interes2, v_seguro, v_sepelio,
    v_param
) => {
    p_fechaIni = new Date(v_param.fechaIni.valueOf()); // v_fechaIni.valueOf()
    const pp = generaPlanPagos_base(
        v_numCuotas, v_nroCuotasFija, v_diaPago, v_interes1, v_interes2, v_seguro, v_sepelio,
        v_monto, v_param
    );
    const cuo = identificarCuotaMasAlta_base(pp);

    return cuo;
};

// ------------- *** Identificación de la cuota más alta (para consulta directa) -------------
const identificarCuotaMasAlta = (v_input, p_param) => {

    v_numCuotas = v_input.numCuotas;
    v_nroCuotasFija = v_input.nroCuotasFija;
    v_fechaDesembolso = v_input.fechaDesembolso;
    v_diaPago = v_input.diaPago;
    v_interes1 = v_input.interes1;
    v_interes2 = v_input.interes2;
    v_seguro = v_input.seguro;
    v_sepelio = v_input.sepelio;
    v_monto = v_input.monto;

    // Parámetros
    const v_param = generaParametros(p_param, v_fechaDesembolso, v_nroCuotasFija);

    // A partir de los datos de entrada se genera el plan de pagos
    const v_pp = generaPlanPagos_base(
        v_numCuotas, v_nroCuotasFija, v_diaPago, v_interes1, v_interes2, v_seguro, v_sepelio,
        v_monto, v_param //, v_fechaIni, v_fechaRevTasa, v_feriados, v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo
    );

    // Con el plan de pagos se identifica la cuota más alta
    const resultado = identificarCuotaMasAlta_base(v_pp);
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

// ------------- *** Identificación de los totales (para consulta directa) -------------
const identificarTotalesPlanPagos = (v_input, p_param) => {
    v_numCuotas = v_input.numCuotas;
    v_nroCuotasFija = v_input.nroCuotasFija;
    v_fechaDesembolso = v_input.fechaDesembolso;
    v_diaPago = v_input.diaPago;
    v_interes1 = v_input.interes1;
    v_interes2 = v_input.interes2;
    v_seguro = v_input.seguro;
    v_sepelio = v_input.sepelio;
    v_monto = v_input.monto;

    // Parámetros
    const v_param = generaParametros(p_param, v_fechaDesembolso, v_nroCuotasFija);

    // Llamada a la función base para generar el plan de pagos
    const v_pp = generaPlanPagos_base(
        v_numCuotas, v_nroCuotasFija, v_diaPago, v_interes1, v_interes2, v_seguro, v_sepelio,
        v_monto, v_param
        //_fechaIni, v_fechaRevTasa, v_feriados, v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo
    );
    const resultado = totalesPlanPagos_base(v_pp);
    return JSON.parse(JSON.stringify({ totales: resultado }));
};
// Auxiliar: Cálculo de Totales del plan de pagos
const totalesPlanPagos_base = (v_pp) => {
    // Variables de datos acumulados
    let acum_capital = 0;
    let acum_interes = 0;
    let acum_capitalMasInt = 0;
    let acum_seguro = 0;
    let acum_cuotaFinal = 0;

    for (i = 0; i < v_pp.length; i++) {
        acum_capital += v_pp[i][2];
        acum_interes += v_pp[i][1];
        acum_capitalMasInt += Math.round((v_pp[i][2] + v_pp[i][1]) * 100) / 100;
        acum_seguro += v_pp[i][5];
        acum_cuotaFinal += v_pp[i][6];
    }
    const resultado = {
        // cuota: '',
        // fechaVenc: '',
        // saldoCapital: '',
        // cuota: null,
        // fechaVenc: null,
        // saldoCapital: null,
        capital: Math.round(acum_capital * 100) / 100,
        interes: Math.round(acum_interes * 100) / 100,
        capitalMasInt: Math.round(acum_capitalMasInt * 100) / 100,
        seguro: Math.round(acum_seguro * 100) / 100,
        cuotaFinal: Math.round(acum_cuotaFinal * 100) / 100
    }
    return resultado;
};

// -------------  *** Búsqueda del monto más alto según la cuota -------------
const buscarMontoPorCuota = (v_input, p_param) => {
    // console.log('p_param en buscarMontoPorCuota', p_param);
    v_numCuotas = v_input.numCuotas;
    v_nroCuotasFija = v_input.nroCuotasFija;
    v_fechaDesembolso = v_input.fechaDesembolso;
    v_diaPago = v_input.diaPago;
    v_interes1 = v_input.interes1;
    v_interes2 = v_input.interes2;
    v_seguro = v_input.seguro;
    v_sepelio = v_input.sepelio;
    v_cuotaMax = v_input.cuotaMax;

    // Parámetros
    const v_param = generaParametros(p_param, v_fechaDesembolso, v_nroCuotasFija);

    // // Se identifica el monto de que conduce a una cuota que no supere la v_cuotaMax
    // console.clear();
    // console.log('v_cuotaMax:', v_cuotaMax);

    // Monto base
    // console.log('v_fechaIni antes del monto base', v_fechaIni);
    const v_monto_0 = v_cuotaMax * v_numCuotas;
    const v_cuota_0 = cuotaMasAlta(v_monto_0, v_numCuotas, v_nroCuotasFija, v_diaPago, v_interes1, v_interes2, v_seguro, v_sepelio, v_param);
    // console.log('v_fechaIni despues del monto base', v_fechaIni);

    // Se verifica que se inicia en una cuota mayor a la cuota máxima definida
    // console.log('Se verifica que se inicia en una cuota mayor a la cuota máxima definida');
    const v_incremento_base = Math.round(v_monto_0 * p_param.binMonto_porcentIntervalo * 100) / 100; // v_binMonto_porcentIntervalo
    let v_monto_base = v_monto_0;
    let v_cuota_base = v_cuota_0;
    let numIter = 0;
    if (v_cuota_base < v_cuotaMax) {
        numIter = 0;
        while (v_cuota_base < v_cuotaMax && v_cuota_base > 0 && v_monto_base > 0 && numIter < p_param.limiteIteraciones) { //&& v_monto_base < v_monto_0 * 1.5 // v_limiteIteraciones
            v_monto_base = Math.round((v_monto_base + v_incremento_base) * 100) / 100;
            v_cuota_base = cuotaMasAlta(v_monto_base, v_numCuotas, v_nroCuotasFija, v_diaPago, v_interes1, v_interes2, v_seguro, v_sepelio, v_param);
            numIter = numIter + 1;
            // console.log('numIter:', numIter, 'v_monto_base:', v_monto_base, 'v_cuota_base:', v_cuota_base);

        }
    }
    // console.log('numIter:', numIter, 'v_monto_base:', v_monto_base, 'v_cuota_base:', v_cuota_base);

    // Se identifica el rango para una búsqueda binaria
    // console.log('Se identifica el rango para una búsqueda binaria');
    const v_decremento_bin = Math.round(v_monto_base * p_param.binMonto_porcentIntervalo * 100) / 100; //v_binMonto_porcentIntervalo
    let v_monto_dec = v_monto_base;
    let v_cuota_dec = v_cuota_base;
    if (v_cuota_dec > v_cuotaMax) {
        numIter = 0;
        while (v_cuota_dec > v_cuotaMax && v_cuota_dec > 0 && v_monto_dec > 0 && numIter < p_param.limiteIteraciones) { //&& v_cuota_dec > v_monto_0 * 0.5 //v_limiteIteraciones
            v_monto_dec = Math.round((v_monto_dec - v_decremento_bin) * 100) / 100;
            v_cuota_dec = cuotaMasAlta(v_monto_dec, v_numCuotas, v_nroCuotasFija, v_diaPago, v_interes1, v_interes2, v_seguro, v_sepelio, v_param);
            numIter = numIter + 1;
            // console.log('numIter:', numIter, 'v_monto_dec:', v_monto_dec, 'v_cuota_dec:', v_cuota_dec);
        }
    }
    // console.log('numIter:', numIter, 'v_monto_dec:', v_monto_dec, 'v_cuota_dec:', v_cuota_dec);

    let aux_intervalo = Math.round(v_monto_base - v_cuota_dec);
    if (aux_intervalo > p_param.binMonto_presicion) { //v_binMonto_presicion
        let aux_monto = v_monto_dec;
        let aux_cuota = v_cuota_dec;
        numIter = 0;
        while (aux_intervalo > p_param.binMonto_presicion && aux_monto > 0 && aux_cuota > 0 && numIter < p_param.limiteIteraciones) { //v_limiteIteraciones //v_binMonto_presicion
            aux_intervalo = Math.round(((v_monto_base - v_monto_dec) / 2) * 100) / 100;
            aux_monto = Math.round((v_monto_dec + aux_intervalo) * 100) / 100;
            aux_cuota = cuotaMasAlta(aux_monto, v_numCuotas, v_nroCuotasFija, v_diaPago, v_interes1, v_interes2, v_seguro, v_sepelio, v_param); // v_fechaIni, v_fechaRevTasa, v_feriados, v_limiteIteraciones, v_binCuota_precision, v_binCuota_porcentIntervalo
            v_monto_base = aux_cuota > v_cuotaMax ? aux_monto : v_monto_base;
            v_cuota_base = aux_cuota > v_cuotaMax ? aux_cuota : v_cuota_base;

            v_monto_dec = aux_cuota <= v_cuotaMax ? aux_monto : v_monto_dec;
            v_cuota_dec = aux_cuota <= v_cuotaMax ? aux_cuota : v_cuota_dec;
            numIter = numIter + 1;
        }
    }
    return JSON.parse(JSON.stringify({ monto: v_monto_dec }));
};

// -------------  *** Identificación de la TEAC (para consulta directa) -------------
const identificarTeac = (v_input, p_param) => {
    v_numCuotas = v_input.numCuotas;
    v_nroCuotasFija = v_input.nroCuotasFija;
    v_fechaDesembolso = v_input.fechaDesembolso;
    v_diaPago = v_input.diaPago;
    v_interes1 = v_input.interes1;
    v_interes2 = v_input.interes2;
    v_seguro = v_input.seguro;
    v_sepelio = v_input.sepelio;
    v_monto = v_input.monto;

    // Parámetros
    const v_param = generaParametros(p_param, v_fechaDesembolso, v_nroCuotasFija);

    p_fechaIni = new Date(v_param.fechaIni.valueOf());
    const pp = generaPlanPagos_base(
        v_numCuotas, v_nroCuotasFija, v_diaPago, v_interes1, v_interes2, v_seguro, v_sepelio,
        v_monto, v_param
    );
    const resultado = teacPlanPagos(pp, v_monto, v_interes1, v_seguro, v_sepelio, v_param.limiteIteraciones);
    return JSON.parse(JSON.stringify({ teac: resultado }));
};
const teacPlanPagos = (v_pp, v_monto, v_interes1, v_seguro, v_sepelio, v_limiteIteraciones) => {
    let resultado = 0;
    // Se continua si existe el plan de pagos
    if (v_pp.length > 0) {
        // Se determina el monto ajustado
        const v_numDias_0 = v_pp[0][0];
        const v_monto_ajustado = v_numDias_0 > 0 ? v_monto - (Math.round(v_numDias_0 * (v_seguro / 360) * v_monto * 100) / 100) - v_sepelio : v_monto;
        // console.log('v_monto_ajustado', v_monto_ajustado);

        // Se agregan los factores "t" y "f" al plan de pagos
        const v_ppf = teacAgregarFactores(v_pp);

        // Se determina la tasa baja
        let v_tasa_ini = Math.round(v_interes1 * 10000000) / 10000000;
        let v_total_ini = teacTotalVPPagos(v_ppf, v_tasa_ini); //0.1753806
        if (v_total_ini < v_monto_ajustado) {
            v_tasa_ini = 0.01;
            v_total_ini = teacTotalVPPagos(v_ppf, v_tasa_ini);
        }
        // console.log('v_tasa_ini', v_tasa_ini, 'v_total_ini', v_total_ini);

        // Se determina la tasa alta
        let v_tasa_fin = Math.round((v_interes1 + 0.1) * 1000000) / 1000000;
        let v_total_fin = teacTotalVPPagos(v_ppf, v_tasa_fin);
        if (v_total_fin > v_monto_ajustado) {
            let multiplicador = 2;
            while (multiplicador <= 20 & v_total_fin > v_monto_ajustado) {
                v_tasa_fin = Math.round((v_interes1 + (multiplicador * 0.1)) * 1000000) / 1000000;
                v_total_fin = teacTotalVPPagos(v_ppf, v_tasa_fin);
                multiplicador = multiplicador + 1;
            }
        }
        // console.log('v_tasa_fin', v_tasa_fin, 'v_total_fin', v_total_fin);


        // Búsqueda binaria de la Teac
        let numIter = 0;
        let v_tasa_eval = Math.round((v_tasa_ini + ((v_tasa_fin - v_tasa_ini) / 2)) * 10000000) / 10000000;
        let v_total_eval = teacTotalVPPagos(v_ppf, v_tasa_eval);
        let v_tasa_eval_anterior = 0;
        while (Math.abs(v_total_eval - v_monto_ajustado) > 0.00001 & numIter < v_limiteIteraciones) {
            if (v_total_eval <= v_monto_ajustado) {
                v_tasa_fin = v_tasa_eval;
                v_total_fin = v_total_eval;
            } else {
                v_tasa_ini = v_tasa_eval;
                v_total_ini = v_total_eval;
            }
            v_tasa_eval = Math.round((v_tasa_ini + ((v_tasa_fin - v_tasa_ini) / 2)) * 10000000) / 10000000;
            v_total_eval = teacTotalVPPagos(v_ppf, v_tasa_eval);
            numIter = numIter + 1;
            // console.log((numIter + 1), '- total_ini:', v_total_ini, 'total_eval:', v_total_eval, 'total_fin:', v_total_fin, ' ; tasa_ini', v_tasa_ini, 'tasa_eval', v_tasa_eval, 'tasa_fin', v_tasa_fin);
            if (v_tasa_eval == v_tasa_eval_anterior) { break; } else { v_tasa_eval_anterior = v_tasa_eval; }
        }
        //console.log('v_tasa_eval', v_tasa_eval, 'v_total_eval', v_total_eval);
        resultado = v_tasa_eval;
    }
    return Math.trunc(resultado * 100000) / 100000;
}
const teacAgregarFactores = (v_pp) => {
    let resultado = [];
    let v_dias_acum = 0;
    for (i = 0; i < v_pp.length; i++) {
        const numDiasHastaPeriodo = v_pp[i][0] + v_dias_acum;
        const v_t = Math.trunc(numDiasHastaPeriodo / 30);
        const v_f = (numDiasHastaPeriodo / 30) - Math.trunc(numDiasHastaPeriodo / 30);
        resultado.push(v_pp[i].concat(v_t).concat(v_f));
        // console.log('cuota', (i + 1), ':', v_pp[i].concat(v_t).concat(v_f));
        v_dias_acum = v_dias_acum + v_pp[i][0];
    }
    return resultado;
}
const teacTotalVPPagos = (v_ppf, v_teac) => {
    const v_i = v_teac / 12;
    let resultado = 0;
    for (i = 0; i < v_ppf.length; i++) {
        const v_cuotaTotal = v_ppf[i][6];
        const v_t = v_ppf[i][8];
        const v_f = v_ppf[i][9];
        const v_cuota_calc = v_cuotaTotal / ((1 + (v_f * v_i)) * (Math.pow(1 + v_i, v_t)));
        // console.log('cuota', (i + 1), v_cuota_calc);
        resultado = resultado + v_cuota_calc;
    }
    return Math.round(resultado * 1000000) / 1000000;
}

// -------------  *** Identificación de la TEA (para consulta directa) -------------
const identificarTea = (v_input, p_param) => {
    // v_numCuotas = v_input.numCuotas;
    // v_nroCuotasFija = v_input.nroCuotasFija;
    // v_fechaDesembolso = v_input.fechaDesembolso;
    // v_diaPago = v_input.diaPago;
    v_interes1 = v_input.interes1;
    // v_interes2 = v_input.interes2;
    v_seguro = v_input.seguro;
    // v_sepelio = v_input.sepelio;
    // v_monto = v_input.monto;
    const resultado = tea_base(v_interes1, v_seguro);

    // const aux = generaPlanCompleto(v_input, p_param);
    // console.log('resultadoCompleto', aux);

    return JSON.parse(JSON.stringify({ tea: resultado }));
};

const tea_base = (v_interes1, v_seguro) => {
    const v_ppi = 30;
    const v_i = v_interes1;
    const v_c = v_seguro;
    const v_or = 0;

    const resultado_base = (Math.pow((1 + ((v_i + v_c) * (v_ppi / 360))), (360 / v_ppi)) / (1 - v_or)) - 1;
    const resultado = Math.round(resultado_base * 100000) / 100000;
    return resultado;
};


// -------------  *** Generación de todos los datos del plan de pago -------------
const generaPlanCompleto = (v_input, p_param) => {
    v_numCuotas = v_input.numCuotas;
    v_nroCuotasFija = v_input.nroCuotasFija;
    v_fechaDesembolso = v_input.fechaDesembolso;
    v_diaPago = v_input.diaPago;
    v_interes1 = v_input.interes1;
    v_interes2 = v_input.interes2;
    v_seguro = v_input.seguro;
    v_sepelio = v_input.sepelio;
    v_monto = v_input.monto;

    // Parámetros
    const v_param = generaParametros(p_param, v_fechaDesembolso, v_nroCuotasFija);

    // Generación del plan de pagos
    const v_pp = generaPlanPagos_base(
        v_numCuotas, v_nroCuotasFija, v_diaPago, v_interes1, v_interes2, v_seguro, v_sepelio,
        v_monto, v_param
    );

    // conversión del plan de pagos en un objeto Json
    let res_planPago = [];
    for (i = 0; i < v_pp.length; i++) {
        res_planPago.push({
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

    // Generación de totales
    const res_totales = totalesPlanPagos_base(v_pp);

    // Identificación de la cuota más alta
    const res_cuotaMax = identificarCuotaMasAlta_base(v_pp);

    // Identificación de la TEAC
    const res_teac = teacPlanPagos(v_pp, v_monto, v_interes1, v_seguro, v_sepelio, v_param.limiteIteraciones);

    // Identificación de la TEA
    const res_tea = tea_base(v_interes1, v_seguro);

    return JSON.parse(JSON.stringify({
        planPago: res_planPago,
        totales: res_totales,
        cuotaMax: res_cuotaMax,
        teac: res_teac,
        tea: res_tea
    }));
};


module.exports = {
    buscarMontoPorCuota,
    generaPlanCompleto,

    generaPlanPagos,
    identificarTotalesPlanPagos,
    identificarCuotaMasAlta,
    identificarTeac,
    identificarTea
};