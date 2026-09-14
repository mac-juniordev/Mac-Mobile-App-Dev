import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Dentist from '../models/Dentist.js';
import connectDB from '../config/db.js';

dotenv.config();

const sampleDentists = [
  {
    fullName: 'Dr. Nji Kevin Fon',
    email: 'kevin.nji@dentcare.com',
    password: 'Dentist123!',
    phone: '+237 6 70 12 34 56',
    licenseNumber: 'DEN-CMR-001',
    specialty: 'Orthodontist',
    qualifications: ['DDS', 'MSc Orthodontics'],
    experience: 12,
    bio: 'Orthodontic specialist focused on braces, clear aligners, and corrective treatments. Dedicated to helping patients achieve healthy, confident smiles.',
    clinic: {
      name: 'Nji Dental & Orthodontic Clinic',
      address: {
        street: 'Commercial Avenue',
        city: 'Bamenda',
        state: 'Northwest',
        zipCode: '00237',
      },
      phone: '+237 6 70 12 34 56',
      hours: {
        monday: { open: '08:00', close: '17:00' },
        tuesday: { open: '08:00', close: '17:00' },
        wednesday: { open: '08:00', close: '17:00' },
        thursday: { open: '08:00', close: '17:00' },
        friday: { open: '08:00', close: '15:00' },
        saturday: { open: '09:00', close: '13:00' },
        sunday: { open: '', close: '' },
      },
    },
    rating: 4.9,
    reviewCount: 234,
    services: ['Cleaning', 'Checkup', 'Braces', 'Whitening', 'Crown'],
    insuranceAccepted: ['AXA', 'Allianz'],
    priceRange: '$$',
    languages: ['English', 'French', 'Pidgin English'],
    photo:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop',
    isActive: true,
  },
  {
    fullName: 'Dr. Mireille Ngono Mbarga',
    email: 'mireille.ngono@dentcare.com',
    password: 'Dentist123!',
    phone: '+237 6 91 23 45 67',
    licenseNumber: 'DEN-CMR-002',
    specialty: 'Cosmetic Dentist',
    qualifications: ['DDS', 'MSc Cosmetic Dentistry'],
    experience: 9,
    bio: 'Passionate about cosmetic and restorative dentistry, with a focus on natural-looking smiles, veneers, whitening, and minimally invasive treatments.',
    clinic: {
      name: 'Mireille Dental Studio',
      address: {
        street: 'Bastos Street',
        city: 'Yaoundé',
        state: 'Centre',
        zipCode: '00237',
      },
      phone: '+237 6 91 23 45 67',
      hours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '16:00' },
        saturday: { open: '10:00', close: '14:00' },
        sunday: { open: '', close: '' },
      },
    },
    rating: 4.8,
    reviewCount: 187,
    services: [
      'Cleaning',
      'Checkup',
      'Whitening',
      'Crown',
      'Bridge',
      'Implant',
    ],
    insuranceAccepted: ['AXA', 'Allianz'],
    priceRange: '$$$',
    languages: ['French', 'English'],
    photo:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1887&auto=format&fit=crop',
    isActive: true,
  },
  {
    fullName: 'Dr. Chantal Tchoumi',
    email: 'chantal.tchoumi@dentcare.com',
    password: 'Dentist123!',
    phone: '+237 6 78 34 56 90',
    licenseNumber: 'DEN-CMR-003',
    specialty: 'Pediatric Dentist',
    qualifications: ['DDS', 'MSc Pediatric Dentistry'],
    experience: 8,
    bio: 'Gentle pediatric dentist committed to making dental visits comfortable and enjoyable for children while helping families build healthy oral-care habits.',
    clinic: {
      name: 'Little Smiles Dental Centre',
      address: {
        street: 'Bonapriso Boulevard',
        city: 'Douala',
        state: 'Littoral',
        zipCode: '00237',
      },
      phone: '+237 6 78 34 56 90',
      hours: {
        monday: { open: '08:30', close: '17:00' },
        tuesday: { open: '08:30', close: '17:00' },
        wednesday: { open: '08:30', close: '17:00' },
        thursday: { open: '08:30', close: '17:00' },
        friday: { open: '08:30', close: '15:00' },
        saturday: { open: '09:00', close: '12:00' },
        sunday: { open: '', close: '' },
      },
    },
    rating: 5.0,
    reviewCount: 312,
    services: ['Cleaning', 'Checkup', 'Filling', 'Extraction'],
    insuranceAccepted: ['AXA', 'Allianz'],
    priceRange: '$$',
    languages: ['French', 'English', 'Pidgin English'],
    photo:
      'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?q=80&w=2070&auto=format&fit=crop',
    isActive: true,
  },
  {
    fullName: 'Dr. Emmanuel Mballa Atangana',
    email: 'emmanuel.mballa@dentcare.com',
    password: 'Dentist123!',
    phone: '+237 6 82 45 67 89',
    licenseNumber: 'DEN-CMR-004',
    specialty: 'Oral Surgeon',
    qualifications: ['BDS', 'MSc Oral Surgery', 'Fellowship Implantology'],
    experience: 15,
    bio: 'Oral surgeon specializing in complex extractions, dental implants, and corrective procedures. Committed to precise treatment and patient comfort.',
    clinic: {
      name: 'Mballa Oral & Dental Surgery Centre',
      address: {
        street: 'Molyko Road',
        city: 'Buea',
        state: 'Southwest',
        zipCode: '00237',
      },
      phone: '+237 6 82 45 67 89',
      hours: {
        monday: { open: '07:00', close: '16:00' },
        tuesday: { open: '07:00', close: '16:00' },
        wednesday: { open: '07:00', close: '16:00' },
        thursday: { open: '07:00', close: '16:00' },
        friday: { open: '07:00', close: '14:00' },
        saturday: { open: '', close: '' },
        sunday: { open: '', close: '' },
      },
    },
    rating: 4.7,
    reviewCount: 156,
    services: ['Extraction', 'Implant', 'Root Canal', 'Filling', 'Checkup'],
    insuranceAccepted: ['Allianz', 'AXA'],
    priceRange: '$$$',
    languages: ['English', 'French'],
    photo:
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=2070&auto=format&fit=crop',
    isActive: true,
  },
  {
    fullName: 'Dr. Brenda Ndam',
    email: 'brenda.ndam@dentcare.com',
    password: 'Dentist123!',
    phone: '+237 6 94 56 78 12',
    licenseNumber: 'DEN-CMR-005',
    specialty: 'General Dentist',
    qualifications: ['DDS'],
    experience: 6,
    bio: 'Providing comprehensive dental care for individuals and families, with a strong focus on prevention, education, and comfortable patient experiences.',
    clinic: {
      name: 'Ndam Family Dental Clinic',
      address: {
        street: 'Station Road',
        city: 'Bamenda',
        state: 'Northwest',
        zipCode: '00237',
      },
      phone: '+237 6 94 56 78 12',
      hours: {
        monday: { open: '08:00', close: '17:00' },
        tuesday: { open: '08:00', close: '17:00' },
        wednesday: { open: '08:00', close: '17:00' },
        thursday: { open: '08:00', close: '17:00' },
        friday: { open: '08:00', close: '17:00' },
        saturday: { open: '09:00', close: '14:00' },
        sunday: { open: '', close: '' },
      },
    },
    rating: 4.8,
    reviewCount: 198,
    services: ['Cleaning', 'Checkup', 'Filling', 'Extraction', 'Whitening'],
    insuranceAccepted: ['AXA', 'Allianz'],
    priceRange: '$',
    languages: ['English', 'French', 'Pidgin English'],
    photo:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop',
    isActive: true,
  },
];

const seedDentists = async () => {
  try {
    await connectDB();

    // Remove existing seeded dentists
    await Dentist.deleteMany({
      email: { $in: sampleDentists.map((d) => d.email) },
    });

    // Insert fresh
    const inserted = await Dentist.insertMany(sampleDentists);

    console.log(`✅ Seeded ${inserted.length} dentists successfully.`);
    inserted.forEach((d) => {
      console.log(`   • ${d.fullName} — ${d.specialty} (${d.clinic.name})`);
    });

    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDentists();