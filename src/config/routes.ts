import authRoutes from "@src/routes/authRoutes";
import mediaRoutes from "@src/routes/mediaRoutes";
import productRoute from "@src/routes/productRoute";
import companyRoute from "@src/routes/companyRoute";
import cartProductRoute from "@src/routes/cartProductRoutes";
import orderRoute from "@src/routes/orderRoutes";
import adminRoute from "@src/routes/adminRoutes";

// Note: the Stripe webhook route is mounted separately in app.ts,
// BEFORE applySecurity()'s express.json(), so it can use express.raw()
// for signature verification. It is intentionally not mounted here.

const routes = (app:any)=>{
  app.use("/api/v1/auth", authRoutes)
  app.use("/api/v1/media", mediaRoutes)
  app.use("/api/v1", productRoute)
  app.use("/api/v1", companyRoute)
  app.use("/api/v1", cartProductRoute)
  app.use("/api/v1", orderRoute)
  app.use("/api/v1/admin", adminRoute)
}

export default routes

