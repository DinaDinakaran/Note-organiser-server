import mongoose from "mongoose";



const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    trim: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },

  hashedpassword: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    default: "user",
    trim: true,
  },
  token: {
    type: String,
    default: "",
  },
  number: {
    type: Number,
    require: true,
  },
  notes:[]
 
});

export default mongoose.model("UserModel", UserSchema);
