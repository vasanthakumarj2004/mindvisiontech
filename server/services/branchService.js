import { Branch } from '../models/Branch.js';

export const listBranches = () => Branch.find({ isActive: true }).sort({ city: 1, name: 1 });