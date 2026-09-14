import "dotenv/config";
import "@colors/colors";

import app from "@src/app";
import connectDB from "@src/config/dbConnection";

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI;

const startServer = async (): Promise<void> => {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is missing in .env");
  }
  await connectDB(MONGO_URI);

  // only listen when running locally, not on Vercel
  if (process.env.VERCEL !== "1") {
    app.listen(PORT, () => {
      console.log(" SERVER ".bgGreen.black.bold, `running on http://localhost:${PORT}`.green);
    });
  }
};

startServer().catch((error: unknown) => {
  console.error(" STARTUP FAILED ".bgRed.white.bold, String(error).red);
  process.exit(1);
});

export default app;
