import mongoose from "mongoose";

export const connectDB = async () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      dbName: "COMPLETE MERN AUTHENTICATION",
    })
    .then(() => {
      console.log("CONNECTED TO THE DATABASE SUCCESSFULLY...");
    })
    .catch((err) => {
      console.log(`there was problem in connecting the database: ${err}`);
    });
};
