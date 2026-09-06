import authRoutes from "@src/routes/authRoutes";
import mediaRoutes from "@src/routes/mediaRoutes";
import productRoute from "@src/routes/productRoute";
import companyRoute from "@src/routes/companyRoute";
import cartProductRoute from "@src/routes/cartProductRoutes";

const routes = (app:any)=>{
  app.use("/api/v1/auth", authRoutes)
  app.use("/api/v1/media", mediaRoutes)
  app.use("/api/v1", productRoute)
  app.use("/api/v1", companyRoute)
  app.use("/api/v1", cartProductRoute)
}

export default routes

