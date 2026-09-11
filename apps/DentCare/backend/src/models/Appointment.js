import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dentist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dentist',
      required: true,
    },
    service: {
      type: String,
      required: true,
      enum: [
        'Cleaning',
        'Checkup',
        'Filling',
        'Root Canal',
        'Extraction',
        'Whitening',
        'Braces',
        'Crown',
        'Bridge',
        'Implant',
        'Other',
      ],
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'missed'],
      default: 'pending',
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    ticketCode: {
      type: String,
      unique: true,
    },
    estimatedCost: {
      type: Number,
    },
    actualCost: {
      type: Number,
    },
    insuranceCovered: {
      type: Number,
      default: 0,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.pre('save', function () {
  if (!this.ticketCode) {
    this.ticketCode = `DC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;