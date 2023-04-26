const { response } = require('express');
const {
    generaPlanPagos,
    identificarCuotaMasAlta,
    buscarMontoPorCuota
} = require('../models/funPlanPago');

const planPagoPost = (req, res = response) => {
    const { numCuotas, nroCuotasFija, fechaDesembolso, diaPago, interes1, interes2, seguro, monto } = req.body;
    res_pp = generaPlanPagos(numCuotas, nroCuotasFija, fechaDesembolso, diaPago, interes1, interes2, seguro, monto);
    res.json(res_pp);
    //res.json({ msg: 'get planPagoPost API - Controlador', numCuotas, nroCuotasFija, fechaDesembolso, diaPago, interes1, interes2, seguro, monto });
};

const cuotaMayorPost = (req, res = response) => {
    console.log('req.body', req.body);
    const { numCuotas, nroCuotasFija, fechaDesembolso, diaPago, interes1, interes2, seguro, monto } = req.body;
    res_cuotaMax = identificarCuotaMasAlta(numCuotas, nroCuotasFija, fechaDesembolso, diaPago, interes1, interes2, seguro, monto);
    console.log('res_cuotaMax', res_cuotaMax);
    res.json(res_cuotaMax);
    //res.json({ msg: 'get cuotaMayorPost API - Controlador', numCuotas, nroCuotasFija, fechaDesembolso, diaPago, interes1, interes2, seguro, monto });
};

const montoPorCuotaPost = (req, res = response) => {
    const { numCuotas, nroCuotasFija, fechaDesembolso, diaPago, interes1, interes2, seguro, cuotaMax } = req.body;
    res_monto = buscarMontoPorCuota(numCuotas, nroCuotasFija, fechaDesembolso, diaPago, interes1, interes2, seguro, cuotaMax);
    res.json(res_monto);
    // res.json({ msg: 'get montoPorCuotaPost API - Controlador', numCuotas, nroCuotasFija, fechaDesembolso, diaPago, interes1, interes2, seguro, cuotaMax });
};
module.exports = {
    planPagoPost,
    cuotaMayorPost,
    montoPorCuotaPost
};