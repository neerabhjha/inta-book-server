const express = require("express");
require("dotenv").config("./.env");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;

const dbConnect = require("./dbConnect");
const authRouter = require("./routers/authRouter");
const postRouter = require("./routers/postsRouter");
const userRouter = require("./routers/UserRouter");
const morgan = require("morgan");

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

//middlewares
app.use(express.json({ limit: "10mb" })); // helps to get data from body
app.use(morgan("common")); // log some information for each api request
app.use(cookieParser());

app.use(
  cors({
    origin: "https://insta-book-app.onrender.com",
  })
);
app.options("*", cors());

//different Routes
app.use("/auth", authRouter);
app.use("/posts", postRouter);
app.use("/user", userRouter);

app.get("/", (req, res) => {
  res.status(200).send("Hello world");
});

dbConnect();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
