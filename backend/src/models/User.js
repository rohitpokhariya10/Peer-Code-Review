import mongoose from "mongoose";
import bcrypt from "bcryptjs";

//User Schema for authentication
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
); // for getting 'createdAt' aur 'updatedAt' automatically

// for encrypt passod before saving in databse
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return; 

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// For matching password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
const User = mongoose.model("User", userSchema);
export default User;