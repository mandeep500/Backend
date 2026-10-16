import express from 'express';
import { 
  createAdmission, 
  getAdmissionByReference, 
  getHealth 
} from '../controllers/admissionController.js';
import { validateAdmissionForm } from '../middleware/validator.js';
import { admissionSubmissionLimiter } from '../middleware/security.js';

const router = express.Router();

// Health Check Endpoint
router.get('/health', getHealth);

// Create Admission Application (Rate-limited, validated, parameterized)
router.post('/admissions', admissionSubmissionLimiter, validateAdmissionForm, createAdmission);

// Lookup Admission Status by Reference ID
router.get('/admissions/:referenceId', getAdmissionByReference);

export default router;

