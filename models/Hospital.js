const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a hospital name'],
        unique: true,
        trim: true,
        maxlength:[50,'Name must be less than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add a address']
    },
    district: {
        type: String,
        required: [true, 'Please add a district']
    },
    province: {
        type: String,
        required: [true, 'Please add a province']
    },
    postalcode: {
        type: String,
        required: [true, 'Please add a postalcode'],
        maxlength: [5, 'Postalcode must be 5 characters'],
    },
    tel: {
        type: String
    },
    region: {
        type: String,
        required: [true, 'Please add a region']
    }
});

module.exports=mongoose.model('Hospital', HospitalSchema);