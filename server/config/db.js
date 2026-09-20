import mongoose from 'mongoose';

export async function connectDatabase(uri) {
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  console.log('MongoDB connection closed');
}