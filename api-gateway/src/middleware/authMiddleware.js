import logger from "../utils/logger.js";
import jwt  from "jsonwebtoken";

export const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    logger.warn("Attempted without a token");
   return res.status(401).json({
      message: "Authentication required",
      success: false,
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
    logger.warn("Invalid token");
     return res.status(429).json({
        error:err,
        message: "Invalid token",
        success: false,
      });
    } 
    req.user = user;
    next();
  });

  
};
