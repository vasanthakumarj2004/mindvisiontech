import { createLead } from '../services/leadService.js';

export async function postLead(req, res) {
  const { name, email, phone, course, branch, message } = req.body;
  const lead = await createLead({
    name,
    email,
    phone,
    course: course || undefined,
    branch: branch || undefined,
    message: message || undefined
  });
  res.status(201).json({ data: lead, message: 'Your enquiry has been received.' });
}