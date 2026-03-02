import express from "express";
import { v2 as cloudinary } from "cloudinary";

// import { AddJobTypes } from "../models/addJob.models";
import multer from "multer";
import { AddHeroImage, addHeroImageTypes } from "../models/addHeroImage";
import { verifyToken } from "../middlewares/verifyToken";

export async function uploadImages(
  imageBody: Express.Multer.File
): Promise<string> {
  try {
    // Convert the buffer to a base64 string
    const b64 = Buffer.from(imageBody.buffer).toString("base64");
    const dataURI = `data:${imageBody.mimetype};base64,${b64}`;

    // Upload the image to Cloudinary
    const res = await cloudinary.uploader.upload(dataURI);
    console.log("Cloudinary URL:", res.url);

    return res.url; // Return the URL from Cloudinary
  } catch (err) {
    console.error("Error uploading to Cloudinary:", err);
    throw new Error("Failed to upload image to Cloudinary");
  }
}
export const addHeroImageRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
});
addHeroImageRouter.post(
  "/addHeroImage",
  verifyToken,
  upload.single("imageFile"),
  async (req, res) => {
    // const body: addHeroImageTypes = req.body;
    try {
      // Extract the uploaded image
      const imageBody = req.file as Express.Multer.File;
      console.log("Uploaded Image:", imageBody);

      if (!imageBody) {
        res.status(400).json({ message: "No image file uploaded" });
        return;
      }

      // Get the authenticated user ID from the tokenl
      const userId = req.userId;
      console.log("User ID:", userId);

      if (!userId) {
        res.status(401).json({ message: "Unauthorized access" });
        return;
      }
      const imageUrl = await uploadImages(imageBody);
      const heroImage: addHeroImageTypes = req.body;
      console.log("heroImage", heroImage);
      // const jobBody: addHeroImageTypes = req.body;
      // jobBody.userId = userId;
      // jobBody.imageFile = imageUrl;
      // Upload the image to Cloudinary and get the URL
      heroImage.userId = userId;

      heroImage.imageFile = imageUrl;
      // const job = await addHeroImageRouter.create(heroImage);
      const image = await AddHeroImage.create(heroImage);
      res.status(200).json({ message: "Job added successfully!", image });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something Went Wrong" });
    }
  }
);
