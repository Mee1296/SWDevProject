const express = require('express');
const {getAppointments, getAppointment, createAppointment, updateAppointment, deleteAppointment} = require('../controllers/appointments');

const router = express.Router({mergeParams:true});

const {protect, authorize} = require('../middleware/auth');

router.route('/')
    .get(protect, getAppointments)
    .post(protect, authorize('user', 'admin'), createAppointment); // This was the intended route for creation from /massageshops/:id/appointments
router.route('/:id').get(protect, getAppointment)
    .put(protect, authorize('user', 'admin'), updateAppointment).
    delete(protect, authorize('user', 'admin'), deleteAppointment);

module.exports=router;