import mongoose from "mongoose";
export type addHeroImageTypes = {
  userId: string;
  _id: string;
  
  // imageUrl: File;
  imageFile: string;
};
const addHeroImageSchema = new mongoose.Schema<addHeroImageTypes>(
  {
    userId: {
      type: String,
    },
    // imageUrl: {
    //   type:File,
    //   required: true,
    // },
    imageFile: {
      type: String
      // required: true,
    }
  },
  { timestamps: true }
);
export const AddHeroImage = mongoose.model<addHeroImageTypes>(
  "AddHeroImage",
  addHeroImageSchema
);
