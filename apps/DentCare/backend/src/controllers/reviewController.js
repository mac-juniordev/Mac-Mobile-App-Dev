import Review from '../models/Review.js';
import Dentist from '../models/Dentist.js';

export const createReview = async (req, res) => {
  try {
    const { dentistId, rating, title, review, wouldRecommend } = req.body;

    // Check if dentist exists
    const dentist = await Dentist.findById(dentistId);
    if (!dentist) {
      return res.status(404).json({
        success: false,
        message: 'Dentist not found',
      });
    }

    // Check if user already reviewed this dentist
    const existingReview = await Review.findOne({
      user: req.user.id,
      dentist: dentistId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this dentist',
      });
    }

    const newReview = await Review.create({
      user: req.user.id,
      dentist: dentistId,
      rating,
      title,
      review,
      wouldRecommend,
    });

    // Update dentist rating
    const reviews = await Review.find({ dentist: dentistId });
    const avgRating = reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;

    dentist.rating = avgRating;
    dentist.reviewCount = reviews.length;
    await dentist.save();

    res.status(201).json({
      success: true,
      review: newReview,
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating review',
    });
  }
};

export const getDentistReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ dentist: req.params.dentistId })
      .populate('user', 'fullName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching reviews',
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review',
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      review: updatedReview,
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating review',
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review',
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting review',
    });
  }
};