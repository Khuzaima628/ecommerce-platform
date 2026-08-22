import  authRoutes  from "@src/routes/authRoutes";

const routes = (app:any)=>{
  app.use("/api/v1/auth", authRoutes)
}

export default routes

