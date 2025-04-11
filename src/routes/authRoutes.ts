import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getUserByEmail,
} from "../controllers/authController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh", refreshToken);
router.get("/user/:email", getUserByEmail);

export default router;
