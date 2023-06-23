const { response } = require('express');
const {
    buscarMontoPorCuota,
    generaPlanCompleto,
    generaPlanPagos,
    identificarTotalesPlanPagos,
    identificarCuotaMasAlta,
    identificarTeac,
    identificarTea
} = require('../models/funPlanPago');

const datos_param = {
    feriados: ['01/01', '22/01', '01/05', '21/06', '02/11', '25/12'],
    limiteIteraciones: 100,
    binCuota_precision: 0.01,
    binCuota_porcentIntervalo: 0.10,
    binMonto_presicion: 0.01,
    binMonto_porcentIntervalo: 0.10
};

const montoPorCuotaPost = (req, res = response) => {
    const { v_input, p_param = datos_param } = req.body;
    res_monto = buscarMontoPorCuota(v_input, p_param);
    res.json(res_monto);
};

const planCompletoPost = (req, res = response) => {
    const { v_input, p_param = datos_param } = req.body;
    res_pp = generaPlanCompleto(v_input, p_param);
    res.json(res_pp);
};

const planPagoPost = (req, res = response) => {
    const { v_input, p_param = datos_param } = req.body;
    res_pp = generaPlanPagos(v_input, p_param);
    res.json(res_pp);
};

const planPagoTotalesPost = (req, res = response) => {
    const { v_input, p_param = datos_param } = req.body;
    res_pp = identificarTotalesPlanPagos(v_input, p_param);
    res.json(res_pp);
};

const cuotaMayorPost = (req, res = response) => {
    const { v_input, p_param = datos_param } = req.body;
    res_cuotaMax = identificarCuotaMasAlta(v_input, p_param);
    res.json(res_cuotaMax);
};

const teacPost = (req, res = response) => {
    const { v_input, p_param = datos_param } = req.body;
    res_teac = identificarTeac(v_input, p_param);
    res.json(res_teac);
};

const teaPost = (req, res = response) => {
    const { v_input, p_param = datos_param } = req.body;
    res_tea = identificarTea(v_input, p_param);
    res.json(res_tea);
};

module.exports = {
    montoPorCuotaPost,
    planCompletoPost,
    planPagoPost,
    planPagoTotalesPost,
    cuotaMayorPost,
    teacPost,
    teaPost
};