import "@colors/colors";
import mongoose from "mongoose";

let cached = (global as any).mongoose as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

const connectDB = async (uri: string): Promise<void> => {
  if (cached.conn) return;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then((m) => m);
  }

  cached.conn = await cached.promise;
  console.log(" DATABASE ".bgCyan.black.bold, "MongoDB connected".cyan);
};

export default connectDB;
