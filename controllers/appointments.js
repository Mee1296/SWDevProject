const Appointment = require('../models/Appointment');
const MassageShop = require('../models/Massageshop');

//@desc    GET All Appointments
//@route    GET /api/v1/appointments
//@access   Public
exports.getAppointments = async (req, res, next) => {
    let query;
    //general users can only see their own appointments
    if(req.user.role !== 'admin') {
        query = Appointment.find({user: req.user.id}).populate({
            path: 'massageShop',
            select: 'name location services'
        });
    }else {
        if(req.params.massageShopId) {
            console.log(req.params.massageShopId);
            query = Appointment.find({massageShop: req.params.massageShopId});
        }else {
            query = Appointment.find().populate({
                path: 'massageShop',
                select: 'name Address Telephone'
            });
        }
    }

    try {
        const appointments = await query;
        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        })

    }catch(err) {
        console.log(err);
        res.status(500).json({success:false, message: "Cannot find Appointment"});
    }
}

//@desc    GET Single Appointment
//@route    GET /api/v1/appointments/:id
//@access   Public
exports.getAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate({
            path: 'massageShop',
            select: 'name Address Telephone'
        });
        if(!appointment) {
            return res.status(404).json({success:false, message: `No appointment with the id of ${req.params.id}`});
        }
        res.status(200).json({
            success:true, 
            data: appointment
        });
    }catch(err) {
        console.log(err);
        res.status(500).json({success:false, message: "Cannot find Appointment"});
    }
};

//@desc    Add Appointment
//@route    POST /api/v1/massageShops/:massageShopId/appointments
//@access   Private
exports.addAppointment = async (req, res, next) => {
    req.body.user = req.user.id;

    const existedAppointment = await Appointment.find({user: req.user.id});

    if(existedAppointment.length >= 3 && req.user.role !== 'admin') {
        return res.status(400).json({success:false, message: `The user with ID ${req.user.id} has already made 3 appointments`});
    }
    try {
        req.body.massageShop = req.params.massageShopId;

        const massageShop = await MassageShop.findById(req.params.massageShopId);
        if(!massageShop) {
            return res.status(404).json({success:false, message: `No massage shop with the id of ${req.params.massageShopId}`});
        }

        const appointment = await Appointment.create(req.body);

        res.status(200).json({
            success: true,
            data: appointment
        });
    }catch (err) {
        console.log(err);
        return res.status(500).json({
            success:false,                     
            message: 'Cannot create appointment'
        });
    }
}

//@desc    Update Single Appointment
//@route    PUT /api/v1/appointments/:id
//@access   Private
exports.updateAppointment = async (req, res, next) => {
    try {
        let appointment = await Appointment.findById(req.params.id);

        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success:false, message: `User ${req.user.id} is not authorized to update this appointment`});
        }

        if(!appointment) {
            return res.status(404).json({success:false, message: `No appointment with the id of ${req.params.id}`});
        }

        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json( {
            success:true,
            data: appointment
        });
    }catch(err) {
        console.log(err);
        res.status(500).json({success:false, message: "Cannot update Appointment"});
    }
}

//@desc    Delete Single Appointment
//@route    DELETE /api/v1/appointments/:id
//@access   Private
exports.deleteAppointment = async (req, res, next) => {
    try {
        let appointment = await Appointment.findById(req.params.id);

        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success:false, message: `User ${req.user.id} is not authorized to delete this appointment`});
        }

        if(!appointment) {
            return res.status(404).json({success:false, message: `No appointment with the id of ${req.params.id}`});
        }

        await appointment.deleteOne();

        res.status(200).json( {
            success:true,
            data: appointment
        });
    }catch(err) {
        console.log(err);
        res.status(500).json({success:false, message: "Cannot update Appointment"});
    }
}