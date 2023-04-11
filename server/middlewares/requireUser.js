const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { error } = require("../utils/responseWrapper");
require("dotenv").config("./.env");

module.exports = async (req, res, next) => {
  if (
    // !req.headers ||
    // !req.headers.authorization ||
    // !req.headers.authorization.startsWith("Bearer")
    // both are same
    !req.headers?.authorization?.startsWith("Bearer")
  ) {
    return res.send(error(401, "Authorization Header Required"));
  }

  const accesstoken = req.headers.authorization.split(" ")[1];

  try {
    const decodedToken = jwt.verify(
      accesstoken,
      process.env.ACCESS_TOKEN_PRIVATE_KEY
    );
    req._id = decodedToken._id;

    const user = await User.findById(req._id);
    if (!user) {
      return res.send(error(404, "User not found"));
    }

    next();
  } catch (e) {
    console.log(e);
    return res.send(error(401, "Invalid Access Token"));
  }
};
