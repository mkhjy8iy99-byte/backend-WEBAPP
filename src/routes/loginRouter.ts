import express, { Request, Response } from "express";
import { User } from "../models/register.models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middlewares/verifyToken";
import cloudinary from "cloudinary";
// import { v2 as cloudinary } from "cloudinary";

// import { AddJobTypes } from "../models/addJob.models";
import multer from "multer";
// import { AddBlog, addBlogTypes } from "../models/addBlog.models";
import { ContactUs, contactUsTypes } from "../models/contactUs.models";
import { authRoles } from "../middlewares/authRoles";
// import { Admin } from "mongodb";
import { AddReview, addReviewTypes } from "../models/addReview.models";
import { AddHotel, addHotelTypes } from "../models/addHotel.models";
import { AddHeroImage } from "../models/addHeroImage";
import { Review } from "../models/addReviewHoteLId";
import { AddBooking, AddBookingTypes } from "../models/addBooking.model";

const JWT_SECRET_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 5 MB limit
  },
});
async function uploadImages(imageFiles: Express.Multer.File[]) {
  const uploadPromises = imageFiles.map(async (image) => {
    const b64 = Buffer.from(image.buffer).toString("base64");
    const dataURI = "data:" + image.mimetype + ";base64," + b64;
    const res = await cloudinary.v2.uploader.upload(dataURI);
    return res.url;
  });

  const imageUrls = await Promise.all(uploadPromises);
  return imageUrls;
}
const loginRouter = express.Router();

///LOGIN ///
loginRouter.post("/login", async (req: Request, resp: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      resp.status(400).json({ message: "Invalid Credentials!" });
      return;
    }

    const isMatchPassword = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!isMatchPassword) {
      resp.status(400).json({ message: "Invalid Credentials!" });
      return;
    }
    const token = jwt.sign(
      { userId: user?.id, role: user?.role },
      JWT_SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );
    resp.cookie("auth_token", token, {
      httpOnly: true,
      secure: true, // Must be true when sameSite is 'None'
      sameSite: "none",
      maxAge: 86400000,
      // httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      // maxAge: 86400000,
    });

    resp.status(200).json({ userId: user?._id });
    // console.log("userResponse", user);
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Something Went Wrong" });
  }
});


loginRouter.get(
  "/validate-token",
  verifyToken,
  async (req: Request, resp: Response) => {
    if (!req.user) {
      // Optional: Add a check for robustness
      resp.status(401).send({ message: "User role not found in token" });
      return;
    } // Send back both userId and role
    resp.status(200).send({ userId: req.userId, role: req.user.role });
  }
);
loginRouter.get(
  "/data",

  async (_req: Request, resp: Response) => {
    resp.status(200).json({ message: "hey data api working a" });
  }
);
// getting id per hotel
loginRouter.get("/rooms/:id", async (req: Request, resp: Response) => {
  const id = req.params.id.toString();
  try {
    const hotel = await AddHotel.findById({
      _id: id,
      // userId: req.userId,
    });
    resp.json(hotel);
  } catch (error) {
    console.error("Error in search route:", error);
    resp.status(500).json({ message: "Internal Server Error" });
  }
});
// In loginRouter.delete("/delete/:hotelId", ...)

loginRouter.delete(
  "/delete/:hotelId",
  verifyToken,
  authRoles("admin"),
  async (req, resp) => {
    try {
      const userId = req.userId;
      const hotelId = req.params.hotelId;

      if (!userId) {
        resp.status(401).json({ message: "Authentication required." });
        return;
      } 

      const deletedHotel = await AddHotel.findOneAndDelete({
        _id: hotelId,
        userId: userId, // ⬅️ Ensures only the owner/admin can delete
      });

      if (!deletedHotel) {
       
        resp
          .status(404)
          .json({ message: "Hotel not found or unauthorized to delete." });
        return;
      }

      resp
        .status(200)
        .json({ message: "Hotel deleted successfully", hotel: deletedHotel });
    } catch (error) {
      console.error("Error in delete hotel route:", error);
      resp.status(500).json({ message: "Internal Server Error" });
    }
  }
);
// getting id per hotel
loginRouter.get(
  "/edit/:id",
  verifyToken,
  authRoles("admin"),
  async (req: Request, resp: Response) => {
    const id = req.params.id.toString();
    try {
      const hotel = await AddHotel.findOne({
        _id: id,
        userId: req.userId,
      });
      resp.json(hotel);
    } catch (error) {
      console.error("Error in search route:", error);
      resp.status(500).json({ message: "Internal Server Error" });
    }
  }
);
// loginRouter.put(
//   "/edit/:hotelId",
//   verifyToken,
//   authRoles("admin"),
//   upload.array("imageFiles"),
//   async (req: Request, resp: Response) => {
//     try {
//          const updateHotel: addHotelTypes = req.body;
//     updateHotel.lastUpdated = new Date();
//     const hotel = await AddHotel.findOneAndUpdate({
//       _id: req.params.hotelId,
//       userId: req.userId,
//     },
//   updateHotel,{
//     new:true
//   });
//   if(!hotel){
//     resp.status(400).json({message:"job not found"})
//     return;
//   };
//   const files = req.files as Express.Multer.File[];
//   const updatedimageURLS = await uploadImages(files);
//   hotel.imageUrls=[...updatedimageURLS,...(updateHotel.imageUrls || "")];

// await hotel.save();
// resp.status(201).json(hotel);

//     } catch (error) {

//     }

//   }
// );
loginRouter.put(
  "/edit/:hotelId",
  verifyToken,
  authRoles("admin"),
  upload.array("imageFiles"),
  async (req: Request, resp: Response) => {
    try {
      const updateHotelData = req.body; // Using a cleaner variable name
      const hotelId = req.params.hotelId;
      const userId = req.userId;

      // 1. Upload new image files first
      const files = req.files as Express.Multer.File[];
      const newImageUrls = await uploadImages(files); // URLs of newly uploaded files

      // 2. Safely get the existing URLs the user chose to KEEP
      // The frontend sends only the URLs that were NOT deleted.
      const keptImageUrls = Array.isArray(updateHotelData.imageUrls)
        ? updateHotelData.imageUrls
        : updateHotelData.imageUrls
        ? [updateHotelData.imageUrls]
        : [];

      // 3. Create the final, merged image array
      const finalImageUrls = [...keptImageUrls, ...newImageUrls];

      // 4. Construct the full update object, setting imageUrls explicitly
      const updateFields = {
        name: updateHotelData.name,
        city: updateHotelData.city,
        description: updateHotelData.description,
        type: updateHotelData.type,
        roomStatus: updateHotelData.roomStatus,
        pricePerNight: updateHotelData.pricePerNight,
        facilities: updateHotelData.facilities, // Mongoose handles array of strings here
        imageUrls: finalImageUrls, // <-- CRITICALLY, overwrite the old array
        lastUpdated: new Date(),
      };

      // 5. Find the specific hotel by ID and USER ID, and apply the $set operation
      const hotel = await AddHotel.findOneAndUpdate(
        { _id: hotelId, userId: userId },
        { $set: updateFields }, // Use $set to replace all fields reliably
        { new: true, runValidators: true } // Return the new document and run validation
      );

      if (!hotel) {
        resp.status(404).json({ message: "Hotel not found or unauthorized." });
        return;
      }

      // No need for hotel.save() if using findOneAndUpdate with {new: true}
      resp.status(200).json(hotel); // Respond with 200 OK (updated resource)
    } catch (error) {
      console.error("Hotel Update Error:", error);
      resp.status(500).json({ message: "Server error during hotel update." });
    }
  }
);
loginRouter.post("/contactUs", async (req: Request, resp: Response) => {
  try {
    const body: contactUsTypes = req.body;

    const info = await ContactUs.create(body);

    resp.status(200).send(info);
  } catch (error) {
    console.error(error);
    resp.status(500).json("Something Went Wrong");
  }
});
loginRouter.get("/contactUs", async (req: Request, resp: Response) => {
  try {
    // Construct the query
    const query = constructSearchQuery(req.query);
    console.log("👉 Incoming Query Params:", req.query);
    console.log("👉 Constructed Mongo Query:", JSON.stringify(query, null, 2));
    //     let sortOptions = {};
    //     switch (req.query.sortOption) {
    //   case "priceAsc":
    //     sortOptions = { pricePerNight: 1 };
    //     break;
    //   case "priceDesc":
    //     sortOptions = { pricePerNight: -1 };
    //     break;
    // }

    // Pagination setup
    const pageSize = 10; // Number of items per page
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1"
    ); // Current page
    const skip = (pageNumber - 1) * pageSize; // Skip items for pagination

    // Fetch matching jobs
    const searchContact = await ContactUs.find(query)
      .sort({ createdAt: -1 }) // newest first if prices equal
      .skip(skip)
      .limit(pageSize);

    // Total matching jobs count
    const total = await ContactUs.countDocuments(query);

    const response: contactUsResponse = {
      data: searchContact,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    resp.status(200).json(response);

    // const hotels=await AddHotel.find();
    // if(!hotels){
    //     resp.status(500).json({ message: "Internal Server Error" });

    // }
    // resp.status(200).json({hotels});
  } catch (error) {
    console.error("Error in search route:", error);
    resp.status(500).json({ message: "Internal Server Error" });
  }
});

// LOGOUT ////

loginRouter.post("/logout", (_req: Request, res: Response) => {
  res.cookie("auth_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(0),
  });
  res.status(200).json("user logged out");
});
//Get User Info
loginRouter.get(
  "/login",

  async (req: Request, resp: Response) => {
    // const body  = req.body;
    try {
      // Extract user ID from request
      // const id = req.userId;
      // console.log("Fetching user with ID:", id);

      // Fetch user with selected fields
      const user = await User.find({ userId: req.userId }).select("firstName");
      //  body.userId = req.userId;
      // Handle case where user is not found
      if (!user) {
        resp.status(404).json({ message: "User not found with this ID" });
      }

      // Send successful response
      resp.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      resp.status(500).json({ message: "Internal Server Error" });
    }
  }
);

//Update User Info///
// loginRouter.put(
//   "/UpdateUser",
//   verifyToken,
//   upload.single("imageFile"),
//   async (req: Request, res: Response): Promise<void> => {
//     try {
//       const { firstName, lastName } = req.body;
//       // const Body:AddJobTypes = req.body;
//       const userId = req.userId;

//       if (!userId) {
//         res.status(404).json({ message: "User ID not found" });
//         return;
//       }

//       const updates: { firstName?: string; lastName?: string } = {};
//       if (firstName) updates.firstName = firstName;
//       if (lastName) updates.lastName = lastName;

//       const updatedUser = await User.findByIdAndUpdate(
//         userId,
//         { $set: updates },
//         { new: true }
//       );

//       if (!updatedUser) {
//         res.status(404).json({ message: "User not found" });
//         return;
//       }
//       if (req.file) {
//         const file = req.file as Express.Multer.File;
//         const updatedImageUrl = await uploadImages(file);

//         updatedUser.imageFile = updatedImageUrl;
//         await updatedUser.save();
//       }
//       res.status(200).json({ user: updatedUser });
//       return;
//     } catch (error) {
//       console.error("Error updating user:", error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   }
// );
loginRouter.get("/rooms", async (req: Request, resp: Response) => {
  try {
    // Construct the query
    const query = constructSearchQuery(req.query);
    let sortOptions = {};
    switch (req.query.sortOption) {
      case "priceAsc":
        sortOptions = { pricePerNight: 1 };
        break;
      case "priceDesc":
        sortOptions = { pricePerNight: -1 };
        break;
    }

    // Pagination setup
    const pageSize = 5; // Number of items per page
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1"
    ); // Current page
    const skip = (pageNumber - 1) * pageSize; // Skip items for pagination

    // Fetch matching jobs
    const searchJob = await AddHotel.find(query)
      .sort({ ...sortOptions, createdAt: -1 }) // newest first if prices equal
      .skip(skip)
      .limit(pageSize);

    // Total matching jobs count
    const total = await AddHotel.countDocuments(query);

    // Build response
    type hotelSearchResponse = {
      data: addHotelTypes[];
      pagination: {
        total: number;
        page: number;
        pages: number;
      };
    };

    const response: hotelSearchResponse = {
      data: searchJob,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    resp.status(200).json(response);

    // const hotels=await AddHotel.find();
    // if(!hotels){
    //     resp.status(500).json({ message: "Internal Server Error" });

    // }
    // resp.status(200).json({hotels});
  } catch (error) {
    console.error("Error in search route:", error);
    resp.status(500).json({ message: "Internal Server Error" });
  }
});
export async function uploadImageHero(
  imageBody: Express.Multer.File
): Promise<string> {
  try {
    // Convert the buffer to a base64 string
    const b64 = Buffer.from(imageBody.buffer).toString("base64");
    const dataURI = `data:${imageBody.mimetype};base64,${b64}`;

    // Upload the image to Cloudinary
    const res = await cloudinary.v2.uploader.upload(dataURI);
    // const res = await cloudinary.uploader.upload(dataURI);
    console.log("Cloudinary URL:", res.url);

    return res.url; // Return the URL from Cloudinary
  } catch (err) {
    console.error("Error uploading to Cloudinary:", err);
    throw new Error("Failed to upload image to Cloudinary");
  }
}
loginRouter.put(
  "/UpdateUser",
  verifyToken,
  authRoles("admin"),
  upload.single("imageFile"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      // const { firstName, lastName } = req.body;
      // const Body:AddJobTypes = req.body;
      // const userId = req.userId;

      // if (!userId) {
      //   res.status(404).json({ message: "User ID not found" });
      //   return;
      // }

      // const updates: { imageFile?: string } = {};
      // if (imageFile) updates.imageFile = imageFile;
      // if (lastName) updates.imageFile = imageFile;
      const updatedImageUrl = AddHeroImage;
      const updatedUser = await AddHeroImage.findOneAndUpdate(
        {}, 
      { $set: { imageFile: updatedImageUrl, userId: req.userId } }, 
      { new: true, upsert: true }
      );

      if (!updatedUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      if (req.file) {
        const file = req.file as Express.Multer.File;
        const updatedImageUrl = await uploadImageHero(file);

        updatedUser.imageFile = updatedImageUrl;
        await updatedUser.save();
      }
      res.status(200).json({ user: updatedUser });
      return;
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);
loginRouter.get("/homeImage", async (req: Request, resp: Response) => {
  try {
    // match by custom userId field
    const homeImage = await AddHeroImage.findOne().select("imageFile");

    if (!homeImage) {
      resp.status(404).json({ message: "Image not found for this user" });
      return;
    }

    resp.status(200).send(homeImage);
  } catch (error) {
    console.error("Error fetching user data:", error);
    resp.status(500).json({ message: "Internal Server Error" });
  }
});

loginRouter.post(
  "/addbookings",
  verifyToken,
  authRoles("admin"),
  async (req: Request, resp: Response) => {
    try {
      const body: AddBookingTypes = {
        ...req.body,
      };

      // console.log("addReviewBody", body);

      const addBookinges = await AddBooking.create(body);
      if (!addBookinges) {
        resp.status(404).json({ message: "Failed to add the review" });
        return;
      }

      resp.status(200).json(addBookinges);
    } catch (error) {
      console.error("Error in addBookinges route:", error);
      resp.status(500).json({ message: "Internal Server Error" });
    }
  }
);
loginRouter.get(
  "/allbooking",
  verifyToken,
  authRoles("admin"),
  async (req: Request, resp: Response) => {
    try {
      const query = constructSearchQuery(req.query);
      // Pagination setup
      const pageSize = 4; // Number of items per page
      const pageNumber = parseInt(
        req.query.page ? req.query.page.toString() : "1"
      ); // Current page
      const skip = (pageNumber - 1) * pageSize; // Skip items for pagination
      //    const searchJob = await AddHotel.find(query)
      // .sort({ ...sortOptions, createdAt: -1 })  // newest first if prices equal
      // .skip(skip)
      // .limit(pageSize);

      // Total matching jobs count
      // const total = await AddHotel.countDocuments(query);

      const booking = await AddBooking.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize);
      // console.log("reviewUserId",Review);
      const total = await AddBooking.countDocuments(query);
      if (!booking) {
        resp.status(404).json({ message: "Failed to add the review" });
        return;
      }
      // Build response
      type bookingSearchResponse = {
        data: AddBookingTypes[];
        pagination: {
          total: number;
          page: number;
          pages: number;
        };
      };

      const response: bookingSearchResponse = {
        data: booking,
        pagination: {
          total,
          page: pageNumber,
          pages: Math.ceil(total / pageSize),
        },
      };

      resp.status(200).json(response);
    } catch (error) {
      console.error("Error in Bookings route:", error);
      resp.status(500).json({ message: "Internal Server Error" });
    }
  }
);

loginRouter.post("/addReview", async (req: Request, resp: Response) => {
  try {
    const body: addReviewTypes = {
      ...req.body,
    };

    // console.log("addReviewBody", body);

    const addReview = await AddReview.create(body);
    if (!addReview) {
      resp.status(404).json({ message: "Failed to add the review" });
      return;
    }

    resp.status(200).json(addReview);
  } catch (error) {
    console.error("Error in addReview route:", error);
    resp.status(500).json({ message: "Internal Server Error" });
  }
});
loginRouter.get("/addReview", async (req: Request, resp: Response) => {
  try {
    const Review = await AddReview.find();
    // console.log("reviewUserId",Review);
    if (!Review) {
      resp.status(404).json({ message: "Failed to add the review" });
      return;
    }

    resp.status(200).json(Review);
  } catch (error) {
    console.error("Error in addReview route:", error);
    resp.status(500).json({ message: "Internal Server Error" });
  }
});
loginRouter.get("/allReview", async (_req: Request, resp: Response) => {
  try {
    const Review = await AddReview.find().sort({ createdAt: -1 });
    // console.log("reviewUserId",Review);
    if (!Review) {
      resp.status(404).json({ message: "Failed to add the review" });
      return;
    }

    resp.status(200).json(Review);
  } catch (error) {
    console.error("Error in addReview route:", error);
    resp.status(500).json({ message: "Internal Server Error" });
  }
});

loginRouter.post(
  "/addRoom",
  verifyToken,
  upload.array("imageFiles", 6),
  // [
  //   body("name").notEmpty().withMessage("Name is required"),
  //   body("city").notEmpty().withMessage("City is required"),
  //   // body("country").notEmpty().withMessage("Country is required"),
  //   body("description").notEmpty().withMessage("Description is required"),
  //   // body("type").notEmpty().withMessage("Hotel type is required"),
  //   body("pricePerNight")
  //     .notEmpty()
  //     .isNumeric()
  //     .withMessage("Price per night is required and must be a number"),
  //   body("facilities")
  //     .notEmpty()
  //     .isArray()
  //     .withMessage("Facilities are required"),
  // ],

  async (req: Request, res: Response) => {
    try {
      const imageFiles = req.files as Express.Multer.File[];
      const newHotel: addHotelTypes = req.body;

      const imageUrls = await uploadImages(imageFiles);

      newHotel.imageUrls = imageUrls;
      newHotel.lastUpdated = new Date();
      newHotel.userId = req.userId;

      const hotel = new AddHotel(newHotel);
      await hotel.save();

      res.status(201).send(hotel);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

export type contactUsResponse = {
  data: contactUsTypes[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
};
// add review
loginRouter.post("/addReview", async (req: Request, resp: Response) => {
  try {
    const body: addReviewTypes = {
      ...req.body,
    };

    // console.log("addReviewBody", body);

    const addReview = await AddReview.create(body);
    if (!addReview) {
      resp.status(404).json({ message: "Failed to add the review" });
      return;
    }

    resp.status(200).json(addReview);
  } catch (error) {
    console.error("Error in addReview route:", error);
    resp.status(500).json({ message: "Internal Server Error" });
  }
});
// loginRouter.get("/addReview", async (req: Request, resp: Response) => {
//   try {
//     const Review = await AddReview.find();
//     // console.log("reviewUserId",Review);
//     if (!Review) {
//       resp.status(404).json({ message: "Failed to add the review" });
//       return;
//     }

//     resp.status(200).json(Review);
//   } catch (error) {
//     console.error("Error in addReview route:", error);
//     resp.status(500).json({ message: "Internal Server Error" });
//   }
// });
loginRouter.get("/allReview", async (_req: Request, resp: Response) => {
  try {
    const Review = await AddReview.find().sort({ createdAt: -1 });
    // console.log("reviewUserId",Review);
    if (!Review) {
      resp.status(404).json({ message: "Failed to add the review" });
      return;
    }

    resp.status(200).json(Review);
  } catch (error) {
    console.error("Error in addReview route:", error);
    resp.status(500).json({ message: "Internal Server Error" });
  }
});
loginRouter.post("/rooms/:id/reviews", async (req: Request, res: Response) => {
  try {
    const { name, message } = req.body;

    const review = await Review.create({
      hotelId: req.params.id,
      name,
      message,
    });

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: "Internal errorss" });
  }
});

// GET /rooms/:id/reviews
loginRouter.get("/rooms/:id/reviews", async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({
      hotelId: req.params.id, // match the hotel ObjectId
    }).sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: "error" });
  }
});
const constructSearchQuery = (queryParams: any) => {
  const constructedQuery: any = {};

  if (queryParams.phoneNumber) {
    constructedQuery.phoneNumber = {
      $regex: queryParams.phoneNumber.toString(),
      $options: "i",
    };
  }

  if (queryParams.name) {
    constructedQuery.name = { $regex: queryParams.name, $options: "i" };
  }

  if (queryParams.email) {
    constructedQuery.email = { $regex: queryParams.email, $options: "i" };
  }

  if (queryParams.city) {
    constructedQuery.city = { $regex: queryParams.city, $options: "i" };
  }

  if (queryParams.maxPrice) {
    constructedQuery.maxPrice = {
      $lte: parseInt(queryParams.maxPrice),
    };
  }

  return constructedQuery; // ✅ always return
};

// const constructSearchQuery = (queryParams: any) => {
//   let constructedQuery: any = {};
//  if (queryParams.phoneNumber) {
//     constructedQuery.phoneNumber = {
//       $regex: queryParams.phoneNumber.toString(),
//       $options: "i",
//     };
//   }

// if (queryParams.name) {
//   constructedQuery.name = { $regex: queryParams.name, $options: "i" };
// }

// if (queryParams.email) {
//   constructedQuery.email = { $regex: queryParams.email, $options: "i" };
// }
// if (queryParams.maxPrice) {
//   constructedQuery.maxPrice = {
//     $lte: parseInt(queryParams.maxPrice).toString(),
//   };

//  if (queryParams.city) {
//     constructedQuery.city = { $regex: queryParams.city, $options: "i" };
//   };
//   // if (queryParams.name) {
//   //   constructedQuery.name = new RegExp(queryParams.name, "i"); // Case-insensitive partial match
//   // }
//   // if (queryParams.maxPrice) {
//   //   constructedQuery.maxPrice = {
//   //     $lte: parseInt(queryParams.maxPrice).toString(),
//   //   };
//   }

//   return constructedQuery;
// };

export { loginRouter };
