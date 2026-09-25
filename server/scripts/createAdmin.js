/**
 * scripts/createAdmin.js
 *
 * One-time CLI script to create an admin account.
 *
 * Usage (from the server/ directory):
 *   node scripts/createAdmin.js admin@example.com secretpassword123
 *
 * Or with a custom role:
 *   node scripts/createAdmin.js admin@example.com secretpassword123 superadmin
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { Admin } from '../models/Admin.js';

const [, , email, password, role = 'admin'] = process.argv;

if (!email || !password) {
  console.error('Usage: node scripts/createAdmin.js <email> <password> [role]');
  process.exit(1);
}

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mindvisiontech';

async function run() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    console.error(`Admin with email "${email}" already exists.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const passwordHash = await Admin.hashPassword(password);
  const admin = await Admin.create({ email: email.toLowerCase().trim(), passwordHash, role });

  console.log(`✅ Admin created successfully:
  ID    : ${admin._id}
  Email : ${admin.email}
  Role  : ${admin.role}`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Error creating admin:', err);
  process.exit(1);
});
