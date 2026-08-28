import authRoutes from "@src/routes/authRoutes";
import mediaRoutes from "@src/routes/mediaRoutes";
import productRoute from "@src/routes/productRoute";

const routes = (app:any)=>{
  app.use("/api/v1/auth", authRoutes)
  app.use("/api/v1/media", mediaRoutes)
  app.use("/api/v1", productRoute)
}

export default routes

