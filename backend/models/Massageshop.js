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
    openTime: {
        type: String,
        required: true,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please use HH:MM format']
    },
    closeTime: {
        type: String,
        required: true,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Please use HH:MM format']
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