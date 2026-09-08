import authRoutes from "@src/routes/authRoutes";
import mediaRoutes from "@src/routes/mediaRoutes";
import productRoute from "@src/routes/productRoute";
import companyRoute from "@src/routes/companyRoute";
import cartProductRoute from "@src/routes/cartProductRoutes";
import orderRoute from "@src/routes/orderRoutes";

const routes = (app:any)=>{
  app.use("/api/v1/auth", authRoutes)
  app.use("/api/v1/media", mediaRoutes)
  app.use("/api/v1", productRoute)
  app.use("/api/v1", companyRoute)
  app.use("/api/v1", cartProductRoute)
  app.use("/api/v1", orderRoute)
}

export default routes

