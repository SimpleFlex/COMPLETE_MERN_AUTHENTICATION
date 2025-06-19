import express from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv";

export const app = express();

config({ path: "./Config/config.env" });

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
