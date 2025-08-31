const express = require('express');
const {getMassageshops, getMassageshop, createMassageshop, updateMassageshop, deleteMassageshop} = require('../controllers/massageshops')
const router = express.Router();


router.route('/').get(getMassageshops).post(createMassageshop);
router.route('/:id').get(getMassageshop).put(updateMassageshop).delete(deleteMassageshop);

module.exports=router;