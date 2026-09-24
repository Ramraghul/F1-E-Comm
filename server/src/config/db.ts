import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export async function connectDB(uri: string = env.MONGODB_URI): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri);
  logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
