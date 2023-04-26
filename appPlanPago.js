/*
const { generaPlanPagos, identificarCuotaMasAlta, buscarMontoPorCuota } = require('./funPlanPago');

// Parámetros base
const p_accionGenerarPlan = true; //true: genera plan de pagos e identifica la cuota más alta
// const p_accionGenerarPlan = false; //false: busca un Monto cuya cuota no supere un monto indicado

const p_monto = 40000; // 40000
const p_cuotaMax = 250; //1015.88; //2800

// Datos de entrada
const p_numCuotas = 60;
const p_nroCuotasFija = 12; //12
const p_fechaDesembolso = '24/01/2023';
const p_diaPago = 01; //25 //30
const p_interes1 = 0.1399;
const p_interes2 = 0.1602;
const p_seguro = 0.0150;

// ----------------- Generación de resultados -----------------
console.clear();
if (p_accionGenerarPlan === true) {
    res_pp = generaPlanPagos(p_numCuotas, p_nroCuotasFija, p_fechaDesembolso, p_diaPago, p_interes1, p_interes2, p_seguro,
        p_monto);
    console.log('res_pp', res_pp);
    console.log('p_monto', p_monto);
    res_cuotaMasAlta = identificarCuotaMasAlta(p_numCuotas, p_nroCuotasFija, p_fechaDesembolso, p_diaPago, p_interes1, p_interes2, p_seguro,
        p_monto);
    console.log('cuotaMasAlta', res_cuotaMasAlta);
} else {
    const res_montoSugerido = buscarMontoPorCuota(p_numCuotas, p_nroCuotasFija, p_fechaDesembolso, p_diaPago, p_interes1, p_interes2, p_seguro,
        p_cuotaMax);
    console.log('p_cuotaMax:', p_cuotaMax);
    console.log('montoSugerido', res_montoSugerido);

}
console.log('-----------------------------------');
console.log('p_numCuotas', p_numCuotas);
console.log('p_nroCuotasFija', p_nroCuotasFija);
console.log('p_fechaDesembolso', p_fechaDesembolso);
// console.log('p_fechaRevTasa', p_fechaRevTasa);
console.log('p_diaPago', p_diaPago);
console.log('p_interes1', p_interes1);
console.log('p_interes2', p_interes2);
console.log('p_seguro', p_seguro);
*/