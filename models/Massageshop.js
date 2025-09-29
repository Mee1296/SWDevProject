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
}, {
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
});

//Reverse populate with virtuals
MassageshopSchema.virtual('appointments', {
    ref: 'Appointment',
    localField: '_id',
    foreignField: 'massageShop',
    justOne: false
});

module.exports = mongoose.model('MassageShop', MassageshopSchema);