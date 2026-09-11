import { createLead } from '../services/leadService.js';

export async function postLead(req, res) {
  const lead = await createLead(req.body);
  res.status(201).json({ data: lead, message: 'Your enquiry has been received.' });
}