import Dentist from '../models/Dentist.js';

export const getAllDentists = async (req, res) => {
  try {
    const { specialty, city, minRating, maxPrice } = req.query;

    let query = { isActive: true };

    if (specialty) {
      query.specialty = specialty;
    }

    if (city) {
      query['clinic.address.city'] = { $regex: city, $options: 'i' };
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    if (maxPrice) {
      query.priceRange = maxPrice;
    }

    const dentists = await Dentist.find(query)
      .select('-password -availability')
      .sort({ rating: -1 });

    res.json({
      success: true,
      count: dentists.length,
      dentists,
    });
  } catch (error) {
    console.error('Get dentists error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dentists',
    });
  }
};

export const getDentistById = async (req, res) => {
  try {
    const dentist = await Dentist.findById(req.params.id)
      .select('-password');

    if (!dentist) {
      return res.status(404).json({
        success: false,
        message: 'Dentist not found',
      });
    }

    res.json({
      success: true,
      dentist,
    });
  } catch (error) {
    console.error('Get dentist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dentist',
    });
  }
};

export const searchDentists = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const dentists = await Dentist.find({
      isActive: true,
      $or: [
        { fullName: { $regex: q, $options: 'i' } },
        { specialty: { $regex: q, $options: 'i' } },
        { 'clinic.name': { $regex: q, $options: 'i' } },
        { 'clinic.address.city': { $regex: q, $options: 'i' } },
        { services: { $regex: q, $options: 'i' } },
      ],
    })
      .select('-password -availability')
      .sort({ rating: -1 });

    res.json({
      success: true,
      count: dentists.length,
      dentists,
    });
  } catch (error) {
    console.error('Search dentists error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching dentists',
    });
  }
};

export const getDentistAvailability = async (req, res) => {
  try {
    const dentist = await Dentist.findById(req.params.id)
      .select('availability');

    if (!dentist) {
      return res.status(404).json({
        success: false,
        message: 'Dentist not found',
      });
    }

    res.json({
      success: true,
      availability: dentist.availability,
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching availability',
    });
  }
};