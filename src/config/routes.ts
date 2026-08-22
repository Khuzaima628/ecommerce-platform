import authRoutes from "@src/routes/authRoutes";
import mediaRoutes from "@src/routes/mediaRoutes";

const routes = (app:any)=>{
  app.use("/api/v1/auth", authRoutes)
  app.use("/api/v1/media", mediaRoutes)
}

export default routes

