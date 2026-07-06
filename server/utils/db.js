import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('[CyberScan] MongoDB connected');
  } catch (err) {
    console.error('[CyberScan] MongoDB connection error:', err.message);
  }
}