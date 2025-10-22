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
    const shop = await Massageshop.findById(req.params.id)
    if (!shop) return res.status(404).json({ success: false, message: 'MassageShop not found' })

    // limit: max 3 reservations per user (active)
    const userCount = await Appointment.countDocuments({ user: req.user.id })
    if (userCount >= 3) {
      return res.status(400).json({ success: false, message: 'You can have up to 3 reservations only' })
    }

    // build appointment — prefer date/time fields from body
    const { date, time, status } = req.body
    const appointment = await Appointment.create({
      user: req.user.id,
      massageShop: shop._id,
      date: date ? new Date(date) : undefined,
      time: time || undefined,
      status: status || 'booked'
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

    const updates = {}
    if (req.body.date) updates.date = new Date(req.body.date)
    if (req.body.time) updates.time = req.body.time
    if (req.body.status && req.user.role === 'admin') updates.status = req.body.status // only admin can change arbitrary status

    appointment = await Appointment.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
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

    await appointment.remove()
    return res.status(200).json({ success: true, data: {} })
  } catch (err) {
    next(err)
  }
}