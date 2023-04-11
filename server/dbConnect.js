const mongoose = require("mongoose");
const { error } = require("./utils/responseWrapper");
require("dotenv").config("./.env");

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};
