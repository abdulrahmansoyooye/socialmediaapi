import express from "express";
import {
  loginUser,
  logoutUser,
  refreshUserToken,
  registerUser,
} from "./../controllers/identity-controllers.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshUserToken);

export default router;
