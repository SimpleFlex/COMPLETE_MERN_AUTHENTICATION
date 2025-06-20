import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import { connectDB } from "./database/db.js";
import { errorMiddleware } from "./middlewares/error.js";

export const app = express();

config({ path: "./Config/config.env" });

app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use(errorMiddleware);
