const { response } = require('express');
const {
    generaPlanPagos,
    identificarCuotaMasAlta,
    buscarMontoPorCuota
} = require('../models/funPlanPago');

const datos_param = {
    feriados: ['01/01', '22/01', '01/05', '21/06', '02/11', '25/12'], //'01/01;22/01;01/05;21/06;02/11;25/12',
    limiteIteraciones: 100,
    binCuota_precision: 0.01,
    binCuota_porcentIntervalo: 0.10,
    binMonto_presicion: 0.01,
    binMonto_porcentIntervalo: 0.10
};

const planPagoPost = (req, res = response) => {
    const { v_input, p_param = datos_param } = req.body; // numCuotas, nroCuotasFija, fechaDesembolso, diaPago, interes1, interes2, seguro, monto
    res_pp = generaPlanPagos(v_input, p_param); // numCuotas, nroCuotasFija, fechaDesembolso, diaPago, interes1, interes2, seguro, monto
    res.json(res_pp);
};

const cuotaMayorPost = (req, res = response) => {
    // console.log('req.body', req.body);
    const { v_input, p_param = datos_param } = req.body; // numCuotas, nroCuotasFija, fechaDesembolso, diaPago, interes1, interes2, seguro, monto
    res_cuotaMax = identificarCuotaMasAlta(v_input, p_param); // numCuotas, nroCuotasFija, fechaDesembolso, diaPago, interes1, interes2, seguro, monto
    // console.log('res_cuotaMax', res_cuotaMax);
    res.json(res_cuotaMax);
};

const montoPorCuotaPost = (req, res = response) => {
    const { v_input, p_param = datos_param } = req.body; // numCuotas, nroCuotasFija, fechaDesembolso, diaPago, interes1, interes2, seguro, cuotaMax
    res_monto = buscarMontoPorCuota(v_input, p_param); // numCuotas, nroCuotasFija, fechaDesembolso, diaPago, interes1, interes2, seguro, cuotaMax
    res.json(res_monto);
};
module.exports = {
    planPagoPost,
    cuotaMayorPost,
    montoPorCuotaPost
};