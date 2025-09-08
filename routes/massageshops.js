const express = require('express');
const {getMassageshops, getMassageshop, createMassageshop, updateMassageshop, deleteMassageshop} = require('../controllers/massageshops')
const router = express.Router();

const {protect, authorize} = require('../middleware/auth');

router.route('/').get(getMassageshops).post(protect, authorize('admin'), createMassageshop);
router.route('/:id').get(getMassageshop).put(protect, authorize('admin'), updateMassageshop).delete(protect, authorize('admin'), deleteMassageshop);

module.exports=router;