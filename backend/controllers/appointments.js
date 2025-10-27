const Appointment = require('../models/Appointment')
const Massageshop = require('../models/Massageshop')

// @desc    Get appointments
// @route   GET /api/v1/appointments
// @access  Private (admin gets all)
exports.getAppointments = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'admin') {
      const appointments = await Appointment.find().populate('massageShop').populate('user', 'name email')
      return res.status(200).json({ success: true, count: appointments.length, data: appointments })
    }
    // regular user -> only their appointments
    const appointments = await Appointment.find({ user: req.user.id }).populate('massageShop')
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
    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
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