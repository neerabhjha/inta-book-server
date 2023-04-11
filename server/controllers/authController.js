const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error, success } = require("../utils/responseWrapper");

const signupController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.send(error(400, "All Fields are required"));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.send(error(400, "User already exists"));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    return res.send(success(201, {user}));
  } catch (e) {
    res.send(error(500, e.message));
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.send(error(400, "Email and Password are required"));
    }

    const checkUser = await User.findOne({ email }).select("+password");
    if (!checkUser) {
      return res.send(error(404, "User not found"));
    }
    const isMatch = await bcrypt.compare(password, checkUser.password);
    if (!isMatch) {
      return res.send(error(403, "Incorrect Password"));
    }
    const accessToken = generateAccessToken({
      _id: checkUser._id,
    });

    const refreshToken = generateRefreshToken({
      _id: checkUser._id,
    });

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return res.send(success(200, { accessToken }));
  } catch (e) {
    res.send(error(500, e.message));
  }
};

const logoutController = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });
    res.send(success(200, "User logged out"));
  } catch (e) {
    res.send(error(500, e.message));
  }
};

//this api will check the refreshToken validity and generate the new accessToken
const refreshAccessTokenController = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies.jwt) {
    return res.send(error(401, "Refresh token in cookie is required"));
  }
  const refreshToken = cookies.jwt;

  try {
    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_PRIVATE_KEY
    );

    const _id = decodedToken._id;
    const accessToken = generateAccessToken({ _id });
    return res.send(success(200, { accessToken }));
  } catch (e) {
    // console.log(e);
    return res.send(error(401, "Invalid Refresh Token"));
  }
};

//internal function
const generateAccessToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
      expiresIn: "1d",
    });
    // console.log(token);
    return token;
  } catch (e) {
    res.send(error(500, e.message));
  }
};

//internal function
const generateRefreshToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY, {
      expiresIn: "1y",
    });
    // console.log(token);
    return token;
  } catch (e) {
    res.send(error(500, e.message));
  }
};

module.exports = {
  signupController,
  loginController,
  refreshAccessTokenController,
  logoutController,
};
