const Appointment = require('../models/Appointment')
const Massageshop = require('../models/Massageshop')

// @desc    Get appointments
// @route   GET /api/v1/appointments
// @access  Private (admin gets all)
exports.getAppointments = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' })

    if (req.user && req.user.role === 'admin') {
      console.log('Admin user detected:', req.user);
      const appointments = await Appointment.find();
      console.log('Raw appointments found:', appointments);
      
      const populatedAppointments = await Appointment.find().populate({
        path: 'massageShop',
        select: 'name address telephone openTime closeTime'
      }).populate('user', 'name email');
      
      console.log('Populated appointments:', populatedAppointments);
      return res.status(200).json({ 
        success: true, 
        count: populatedAppointments.length, 
        data: populatedAppointments 
      });
    }
    // regular user -> only their appointments
    console.log('requesting user id:', req.user.id) // ensure user id logged
    const appointments = await Appointment.find({ user: req.user.id }).populate({
      path: 'massageShop',
      // Select all fields except the virtual 'appointments' field to prevent circular population
      select: 'name address telephone openTime closeTime'
    })
    console.log('user appointments:', appointments);
    return res.status(200).json({ success: true, count: appointments.length, data: appointments })
  } catch (err) {
    next(err)
  }
}

// @desc    Get single appointment
// @route   GET /api/v1/appointments/:id
// @access  Private (owner or admin)
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('massageShop').populate('user', 'name email')
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' })

    // ownership / admin check
    if (appointment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this appointment' })
    }

    return res.status(200).json({ success: true, data: appointment })
  } catch (err) {
    next(err)
  }
}

// @desc    Create appointment for a massage shop
// @route   POST /api/v1/massageshops/:id/appointments
// @access  Private
exports.createAppointment = async (req, res, next) => {
  try {
    // ensure shop exists
    const shop = await Massageshop.findById(req.params.massageShopId)
    if (!shop) return res.status(404).json({ success: false, message: 'MassageShop not found' })

    // limit: max 3 reservations per user (active)
    const userCount = await Appointment.countDocuments({ user: req.user.id })
    if (userCount >= 3) {
      return res.status(400).json({ success: false, message: 'You can have up to 3 reservations only' })
    }

    // build appointment — prefer date/time fields from body
    const { date, time } = req.body
    if (!date || !time) return res.status(400).json({ success: false, message: 'Please specify a date and time' })

    const apptDate = new Date(`${date}T${time}`);

    // Check if the created date is valid
    if (isNaN(apptDate.getTime())) return res.status(400).json({ success: false, message: 'Invalid date or time format' });

    // Check if appointment is in the past
    const now = new Date();
    if (apptDate < now) {
      return res.status(400).json({ success: false, message: 'Cannot book an appointment in the past' });
    }

    // Check if appointment time is within shop's open-close time
    const [openHour, openMinute] = shop.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = shop.closeTime.split(':').map(Number);

    const apptHour = apptDate.getHours();
    const apptMinute = apptDate.getMinutes();

    if (apptHour < openHour || (apptHour === openHour && apptMinute < openMinute) || apptHour > closeHour || (apptHour === closeHour && apptMinute > closeMinute)) {
      return res.status(400).json({ success: false, message: `Appointment time is outside of shop's operating hours (${shop.openTime} - ${shop.closeTime})` });
    }

    // Prevent duplicate (same date + shop)
    const existing = await Appointment.findOne({
      user: req.user.id,
      massageShop: shop._id,
      apptDate: apptDate
    })
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already booked this massage shop for that date' })
    }
    
    const appointment = await Appointment.create({
      apptDate,
      user: req.user.id,
      massageShop: shop._id
    })

    return res.status(201).json({ success: true, data: appointment })
  } catch (err) {
    next(err)
  }
}

// @desc    Update appointment
// @route   PUT /api/v1/appointments/:id
// @access  Private (owner or admin)
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id)
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' })

    // permission
    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this appointment' })
    }

    // Combine date and time into apptDate if both are provided
    if (req.body.date && req.body.time) {
      appointment.apptDate = new Date(`${req.body.date}T${req.body.time}`);
    }

    // only admin can change arbitrary status
    if (req.body.status && req.user.role === 'admin') appointment.status = req.body.status

    await appointment.save({ validateBeforeSave: true });
    return res.status(200).json({ success: true, data: appointment })
  } catch (err) {
    next(err)
  }
}

// @desc    Delete appointment
// @route   DELETE /api/v1/appointments/:id
// @access  Private (owner or admin)
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' })

    // permission
    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this appointment' })
    }

    await Appointment.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, data: {} })
  } catch (err) {
    next(err)
  }
}