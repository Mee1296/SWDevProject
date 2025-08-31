const mongoose = require('mongoose');

const MassageshopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    telephone: {
        type: String,
        required: true
    },
    openCloseTime: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Massageshop', MassageshopSchema);