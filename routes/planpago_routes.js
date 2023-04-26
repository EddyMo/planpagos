const { Router } = require('express');
const {
    planPagoPost,
    cuotaMayorPost,
    montoPorCuotaPost
} = require('../controllers/planpago_controller');

const router = Router();

router.post('/planpago', planPagoPost);
router.post('/cuotamayor', cuotaMayorPost);
router.post('/montoporcuota', montoPorCuotaPost);

module.exports = router;