export const authenticateRequest = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    logger.warn("Attempted without a user Id");
    req.status(401).json({
      message: "Authentication required",
      success: false,
    });
  }
  req.user = { userId };
  next();
};
