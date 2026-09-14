import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const dentistSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Dentist name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      enum: [
        'General Dentist',
        'Orthodontist',
        'Periodontist',
        'Endodontist',
        'Pediatric Dentist',
        'Oral Surgeon',
        'Cosmetic Dentist',
        'Prosthodontist',
      ],
    },
    qualifications: [String],
    experience: {
      type: Number,
      required: true,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    clinic: {
      name: {
        type: String,
        required: true,
      },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
      },
      phone: String,
      hours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String },
      },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    services: [String],
    insuranceAccepted: [String],
    priceRange: {
      type: String,
      enum: ['$', '$$', '$$$'],
    },
    languages: [String],
    photo: String,
    availability: [
      {
        date: Date,
        slots: [
          {
            time: String,
            isBooked: {
              type: Boolean,
              default: false,
            },
          },
        ],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
dentistSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
dentistSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Dentist = mongoose.model('Dentist', dentistSchema);

export default Dentist;