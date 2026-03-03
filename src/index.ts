import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express ,{Response, Request} from "express";
// import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import { registerRouter } from "./routes/registerRouter";
import { loginRouter } from "./routes/loginRouter";
import { v2 as cloudinary } from "cloudinary";
import { addHeroImageRouter } from "./routes/addHeroImageRouter";

// zxcvvcxz
const MONGODB_URL = "mongodb+srv://hotelbackend:zxcvvcxz@cluster0.245yfua.mongodb.net/?appName=Cluster0";
const app = express();
app.use(express.json());

console.log(MONGODB_URL)


mongoose
  .connect(MONGODB_URL)
  .then(() => console.log("Database connected successfully"))
  .catch((error) => {
    console.error("Database connection error:", error);
  });
const allowedOrigins = [
  "https://demosekaispacehotelapp.vercel.app",
  "http://localhost:3000"

];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

cloudinary.config({
    cloud_name: "zainmughal999", 
  api_key:"744766614756274", 
  api_secret: "F5uKFc-wILFbT2CW44eUJzDV8o8"
  // cloud_name: "oh1XJ4ucXibvjBGywHQ_vkXRQv4",
  // api_key: "227999443996848",
  // api_secret: "Zain_Choudhary",
});

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/v1", registerRouter);
app.use("/v2", loginRouter);
app.use("/v3", addHeroImageRouter);






app.get("/", (_req, res:Response) => {
  res.send("✅ Backend running successfully !");
});

app.listen(8000,()=>{
  console.log("app is 8000")
})