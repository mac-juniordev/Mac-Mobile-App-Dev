import Appointment from '../models/Appointment.js';
import Dentist from '../models/Dentist.js';
import User from '../models/User.js';

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
export const createAppointment = async (req, res) => {
  try {
    const { dentistId, service, date, time, notes, estimatedCost } = req.body;

    // Validate dentist exists
    const dentist = await Dentist.findById(dentistId);
    if (!dentist) {
      return res.status(404).json({
        success: false,
        message: 'Dentist not found',
      });
    }

    // Check if dentist is active
    if (!dentist.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This dentist is not currently accepting appointments',
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      user: req.user.id,
      dentist: dentistId,
      service,
      date,
      time,
      notes,
      estimatedCost,
    });

    // Populate dentist details
    await appointment.populate('dentist', 'fullName specialty clinic rating');
    await appointment.populate('user', 'fullName email phone');

    res.status(201).json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating appointment',
    });
  }
};

// @desc    Get all appointments for current user
// @route   GET /api/appointments
// @access  Private
export const getUserAppointments = async (req, res) => {
  try {
    const { status, upcoming } = req.query;

    let query = { user: req.user.id };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter upcoming only
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const appointments = await Appointment.find(query)
      .populate('dentist', 'fullName specialty clinic rating photo')
      .sort({ date: 1, time: 1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointments',
    });
  }
};

// @desc    Get single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('dentist', 'fullName specialty clinic rating photo')
      .populate('user', 'fullName email phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if appointment belongs to user
    if (appointment.user._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment',
      });
    }

    res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointment',
    });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if appointment belongs to user
    if (appointment.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment',
      });
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed appointment',
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled',
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment,
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling appointment',
    });
  }
};

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private
export const rescheduleAppointment = async (req, res) => {
  try {
    const { date, time } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if appointment belongs to user
    if (appointment.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reschedule this appointment',
      });
    }

    // Check if appointment can be rescheduled
    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule completed appointment',
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule cancelled appointment',
      });
    }

    appointment.date = date;
    appointment.time = time;
    appointment.status = 'pending';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment,
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rescheduling appointment',
    });
  }
};

// @desc    Get appointment ticket (with QR code data)
// @route   GET /api/appointments/:id/ticket
// @access  Private
export const getAppointmentTicket = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('dentist', 'fullName specialty clinic')
      .populate('user', 'fullName email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if appointment belongs to user
    if (appointment.user._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this ticket',
      });
    }

    // Generate ticket data for QR code
    const ticketData = {
      appointmentId: appointment._id,
      ticketCode: appointment.ticketCode,
      patientName: appointment.user.fullName,
      dentistName: appointment.dentist.fullName,
      clinicName: appointment.dentist.clinic.name,
      service: appointment.service,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
    };

    res.json({
      success: true,
      ticket: ticketData,
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching ticket',
    });
  }
};

// @desc    Get appointment stats (counts for profile/dashboard)
// @route   GET /api/appointments/stats
// @access  Private
export const getAppointmentStats = async (req, res) => {
  try {
    const now = new Date();

    const [upcoming, missed, completed, total] = await Promise.all([
      // Upcoming: future appointments that aren't cancelled
      Appointment.countDocuments({
        user: req.user.id,
        date: { $gte: now },
        status: { $in: ['pending', 'confirmed'] },
      }),

      // Missed: past appointments that weren't completed or cancelled
      Appointment.countDocuments({
        user: req.user.id,
        date: { $lt: now },
        status: { $in: ['pending', 'confirmed', 'missed'] },
      }),

      // Completed
      Appointment.countDocuments({
        user: req.user.id,
        status: 'completed',
      }),

      // Total (excluding cancelled)
      Appointment.countDocuments({
        user: req.user.id,
        status: { $ne: 'cancelled' },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        upcoming,
        missed,
        completed,
        total,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching stats',
    });
  }
};