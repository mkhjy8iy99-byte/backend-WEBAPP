// import express ,{Response, Router} from "express";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import serverless from "serverless-http";
// import mongoose from "mongoose";
// import { registerRouter } from "./routes/registerRouter";
// import { loginRouter } from "./routes/loginRouter";
// import { v2 as cloudinary } from "cloudinary";
// import { addHeroImageRouter } from "./routes/addHeroImageRouter";
// import dotenv from "dotenv";
// dotenv.config();
// const MONGODB_URL = "mongodb+srv://mzainmumtaz99_db_user:yf3e6r4ANk545NTk@cluster0.245yfua.mongodb.net/?appName=Cluster0";
// const app = express();
// app.use(express.json());




// mongoose
//   .connect(MONGODB_URL)
//   .then(() => console.log("Database connected successfully"))
//   .catch((error) => {
//     console.error("Database connection error:", error);
//   });
// const allowedOrigins = [
//   "https://demosekaispacehotelapp.vercel.app",
//   "http://localhost:3000"

// ];
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       } else {
//         return callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );
// // app.use(
// //   cors({
// //     origin: "https://demosekaispacehotelapp.vercel.app",
 

// //     credentials: true,
// //   })
// // );
// // 
// // const CLOUDINARY_API_SECRET=oh1XJ4ucXibvjBGywHQ_vkXRQv4
// // const CLOUDINARY_API_KEY=227999443996848
// // const CLOUDINARY_CLOUD_NAME=Zain_Choudhary
// cloudinary.config({
//     cloud_name: "zainmughal999", 
//   api_key:"744766614756274", 
//   api_secret: "F5uKFc-wILFbT2CW44eUJzDV8o8"
//   // cloud_name: "oh1XJ4ucXibvjBGywHQ_vkXRQv4",
//   // api_key: "227999443996848",
//   // api_secret: "Zain_Choudhary",
// });

// const router = Router();
// app.use(cookieParser());
// app.use(express.urlencoded({ extended: true }));
// router.use("/v1", registerRouter);
// router.use("/v2", loginRouter);
// router.use("/v3", addHeroImageRouter);






// app.get("/", (_req, res:Response) => {
//   res.send("✅ Backend running successfully !");
// });
// const handler = serverless(app);
// console.log("handler",handler);
// export { handler };
// app.listen(8000,()=>{
//   console.log("app is 8000")
// })
import express, { Response } from "express";
import cookieParser from "cookie-parser";
// import dotenv from "dotenv";
import cors from "cors";
import serverless from "serverless-http";
import mongoose from "mongoose";
import { registerRouter } from "./routes/registerRouter";
import { loginRouter } from "./routes/loginRouter";
import { addHeroImageRouter } from "./routes/addHeroImageRouter";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
mongoose
  .connect("mongodb+srv://mzainmumtaz99_db_user:ZwJ1VUxBOBIgmYEP@cluster0.245yfua.mongodb.net/")
  .then(() => console.log("Database connected successfully"))
  .catch((error) => console.error("Database connection error:", error));

const allowedOrigins = [
  "https://demosekaispacehotelapp.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

cloudinary.config({
  cloud_name: "zainmughal999",
  api_key: "744766614756274",
  api_secret: "F5uKFc-wILFbT2CW44eUJzDV8o8"
});

// Mount routers directly on app
app.use("/v1", registerRouter);
app.use("/v2", loginRouter);
app.use("/v3", addHeroImageRouter);

app.get("/", (_req, res: Response) => {
  res.send("✅ Backend running successfully!");
});


// Local dev
app.listen(3000, "0.0.0.0", () => {
  console.log("Server running");
});