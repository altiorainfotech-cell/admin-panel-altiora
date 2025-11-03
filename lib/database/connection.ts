import { connectToDatabase as mongooseConnect } from '@/lib/mongoose'

// Re-export the connectToDatabase function from mongoose
export const connectToDatabase = mongooseConnect