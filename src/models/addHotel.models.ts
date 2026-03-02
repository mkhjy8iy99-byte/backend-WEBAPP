import mongoose, { Types } from "mongoose";
// const reviewIDSchema = new mongoose.Schema({
//      name: {
//       type: String,
//       required: true,
//     },
//     message: {
//       type: String,
//       required: true,
//     },  createdAt: { type: Date, default: Date.now },
// })
export type addHotelTypes = {
  _id: string;
  userId: string;
  name: string;
  city: string;
 
  description: string;
  type: string;
  // adultCount: number;
  // childCount: number;
  facilities: string[];
  pricePerNight: number;
  // starRating: number;
  imageUrls: string[];
imageFiles: FileList;
roomStatus:string,
  // reviews: {          // <-- add this
  //   name: string;
  //   message: string;
  //   createdAt: Date;
  // }[];
  // reviews: Types.ObjectId[]; 
  lastUpdated: Date;

};
const HotelSchema = new mongoose.Schema<addHotelTypes>(
  {
     userId: { type: String,  },
  name: { type: String,  },
  city: { type: String,  },

  description: { type: String,required:true  },
  type: { type: String,  },
  // adultCount: { type: Number,  },
  // childCount: { type: Number,  },
  facilities: [{ type: String,  }],
  roomStatus:{
  type:String,
  enum:["Booked","Available","Maintenance"],
default:"Available"},
  pricePerNight: { type: Number,  },
  // starRating: { type: Number,  min: 1, max: 5 },
  imageUrls: [{ type: String,  }],
  //  reviews: [reviewIDSchema],
  lastUpdated: { type: Date  },
  },
  { timestamps: true }
);
export const AddHotel = mongoose.model<addHotelTypes>("AddHotel", HotelSchema);
