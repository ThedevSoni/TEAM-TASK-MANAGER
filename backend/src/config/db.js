import mongoose from 'mongoose';

// Opens the MongoDB connection before the API starts accepting requests.
export const connectDB = async () => {
  // strictQuery keeps Mongoose query filtering predictable.
  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.MONGO_URI);
  console.log("DB Connected");
};
