import { listBranches } from '../services/branchService.js';

export async function getBranches(_req, res) {
  res.json({ data: await listBranches() });
}