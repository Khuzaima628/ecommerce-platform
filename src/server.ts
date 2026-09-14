import "dotenv/config";
import "@colors/colors";

import app from "@src/app";
import connectDB from "@src/config/dbConnection";

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) throw new Error("MONGO_URI is missing in .env");

const dbReady = connectDB(MONGO_URI).catch((error: unknown) => {
  console.error(" DB FAILED ".bgRed.white.bold, String(error).red);
  process.exit(1);
});

if (process.env.VERCEL !== "1") {
  dbReady.then(() => {
    app.listen(PORT, () => {
      console.log(" SERVER ".bgGreen.black.bold, `running on http://localhost:${PORT}`.green);
    });
  });
}

export default app;
