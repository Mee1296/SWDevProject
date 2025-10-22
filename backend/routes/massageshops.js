const express = require('express');
const {getMassageshops, getMassageshop, createMassageshop, updateMassageshop, deleteMassageshop} = require('../controllers/massageshops')
const { createAppointment } = require('../controllers/appointments')
const router = express.Router();

const appointmentRouter = require('./Appointments');

const {protect, authorize} = require('../middleware/auth');

router.use('/:massageShopId/appointments', appointmentRouter);

router.route('/').get(getMassageshops).post(protect, authorize('admin'), createMassageshop);
router.route('/:id').get(getMassageshop).put(protect, authorize('admin'), updateMassageshop).delete(protect, authorize('admin'), deleteMassageshop);

router.route('/:id/appointments').post(protect, createAppointment)

module.exports=router;