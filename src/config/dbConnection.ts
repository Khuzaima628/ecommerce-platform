import "@colors/colors";
import mongoose from "mongoose";

const connectDB = async (uri: string): Promise<void> => {
  await mongoose.connect(uri);
  console.log(" DATABASE ".bgCyan.black.bold, "MongoDB connected".cyan);
};

export default connectDB;
