import mongoose from "mongoose";
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`mongoDB Connected`);
  } catch (error) {
    console.log(`Error in connection mongoDB ${error}`);
    process.exit(1);
  }
};
export default connectDb;
