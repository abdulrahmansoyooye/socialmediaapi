// user registration
import { asyncHanlder } from "../middleware/errorHandler.js";
import logger from "./../utils/logger.js";
import User from "./../models/User.js";
import generateTokens from "../utils/generateToken.js";
import { validateLogin, validateRegistration } from "../utils/validation.js";
import RefreshToken from "../models/RefreshToken.js";
// const logger

export const registerUser = async (req, res) => {
  logger.info("Registration endpoint hit...");
  try {
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, password, username } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      logger.warn("User already exists");
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    user = new User({ username, email, password });
    await user.save();
    logger.warn("User saved successfully", user._id);
    const { accessToken, refreshToken } = await generateTokens(user);

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
      })
      .status(201)
      .json({
        success: true,
        message: "User registered sucessfully!",
        accessToken,
      });
  } catch (error) {
    logger.error("Registration Error occured", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// user login
export const loginUser = async (req, res) => {
  logger.info(`Login Endpoint Hit... `);
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn("Invalid user");
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const ispasswordValid = await user.comparePassword(password);

    if (!ispasswordValid) {
      logger.warn("Inavlid password");
      return res.status(400).json({
        success: false,
        message: "Inavlid password",
      });
    }
    const { accessToken, refreshToken } = await generateTokens(user);
    res
      .cookie(
        "refreshToken",
        {
          refreshToken,
        },
        {
          httpOnly: true,
          secure: false,
        }
      )
      .status(201)
      .json({
        success: true,
        userId: user._id,
        accessToken,
      });
  } catch (e) {
    logger.error("Login Error occured", e);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// refresh token
export const refreshUserToken = async (req, res) => {
  logger.info(`Refresh Token Endpoint Hit... `);

  try {
    const { refreshToken } = req.cookies.refreshToken;
    
    if (!refreshToken) {
      logger.warn("Refresh Token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh Token missing",
      });
    }

    const storedrefreshToken = await RefreshToken.findOne({
      token: refreshToken,
    });

    if (!storedrefreshToken || storedrefreshToken.expiresAt < new Date()) {
      logger.warn("Inavlid or expired refresh token");
      return res.status(401).json({
        success: false,
        message: "Inavlid or expired refresh token",
      });
    }

    const user =await User.findById(storedrefreshToken.user);
    if (!user) {
      logger.warn("User not found");
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    const { accessToken: newaccessToken, refreshToken: newrefreshToken } =
      await generateTokens(user);

    await RefreshToken.deleteOne({ _id: storedrefreshToken._id });

    return res
      .cookie(
        "refreshToken",
        {
          refreshToken: newrefreshToken,
        },
        {
          httpOnly: true,
          secure: false,
        }
      )

      .json({
        accessToken: newaccessToken,
      });
  } catch (error) {
    logger.error("Refresh Token error occured", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// logout

export const logoutUser = async (req, res) => {
  logger.info("Logout endpoint hit...");
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh Token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh Token missing",
      });
    }
    await RefreshToken.deleteOne({ token: refreshToken });
    logger.info("Refresh token deleted for logout");
    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error("Registration Error occured", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
