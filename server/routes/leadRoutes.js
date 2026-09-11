import { Router } from 'express';
import { body } from 'express-validator';
import { postLead } from '../controllers/leadController.js';
import { validate } from '../middleware/validation.js';

const router = Router();
router.post('/', [body('name').trim().notEmpty(), body('email').isEmail(), body('phone').trim().notEmpty()], validate, postLead);
export default router;