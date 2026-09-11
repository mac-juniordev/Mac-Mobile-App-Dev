import express from 'express';
import {
  createAppointment,
  getUserAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  getAppointmentTicket,
  getAppointmentStats, // ← ADD
} from '../controllers/appointmentController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .post(createAppointment)
  .get(getUserAppointments);

router.get('/stats', getAppointmentStats)
router.route('/:id')
  .get(getAppointmentById);

router.put('/:id/cancel', cancelAppointment);
router.put('/:id/reschedule', rescheduleAppointment);
router.get('/:id/ticket', getAppointmentTicket);

export default router;