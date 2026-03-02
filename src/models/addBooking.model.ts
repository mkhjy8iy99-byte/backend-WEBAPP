import mongoose from "mongoose";
export type AddBookingTypes = {
  userId: string;
  _id: string;
  name: string;
  phoneNumber: string;
  Amount: string;
  time: string;
  
  createdAt: Date;
};
const AddBookingSchema = new mongoose.Schema<AddBookingTypes>(
  {
    userId: {
      type: String,
    },
    // imageUrl: {
    //   type:File,
    //   required: true,
    // },
    name: {
      type: String
      // required: true,
    },
    phoneNumber: {
      type: String
      // required: true,
    },
    Amount: {
      type: String
      // required: true,
    },
    time: {
      type: String
      // required: true,
    },
  },
  { timestamps: true }
);
export const AddBooking = mongoose.model<AddBookingTypes>(
  "AddBooking",
  AddBookingSchema
);
