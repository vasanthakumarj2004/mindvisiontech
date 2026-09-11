import { Lead } from '../models/Lead.js';

export const createLead = (payload) => Lead.create(payload);