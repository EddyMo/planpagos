const { Router } = require('express');
const {
    montoPorCuotaPost,
    planCompletoPost,
    planPagoPost,
    planPagoTotalesPost,
    cuotaMayorPost,
    teacPost,
    teaPost
} = require('../controllers/planpago_controller');

const router = Router();

router.post('/montoporcuota', montoPorCuotaPost);
router.post('/plancompleto', planCompletoPost);

router.post('/planpago', planPagoPost);
router.post('/planpagototales', planPagoTotalesPost);
router.post('/cuotamayor', cuotaMayorPost);
router.post('/teac', teacPost);
router.post('/tea', teaPost);

module.exports = router;