import express from 'express';
import {
  getAllDentists,
  getDentistById,
  searchDentists,
  getDentistAvailability,
} from '../controllers/dentistController.js';

const router = express.Router();

router.get('/', getAllDentists);
router.get('/search', searchDentists);
router.get('/:id', getDentistById);
router.get('/:id/availability', getDentistAvailability);

export default router;