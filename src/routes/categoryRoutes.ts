import express from "express";
import {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory,
} from "../controllers/categoryController";

const router = express.Router();

router.get("/", getCategories);
router.post("/", addCategory);
router.put("/:category_id", updateCategory);
router.delete("/:category_id", deleteCategory);

export default router;
