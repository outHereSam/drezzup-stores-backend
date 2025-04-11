import express from "express";
import {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory,
  getCategoryByCategoryName,
} from "../controllers/categoryController";

const router = express.Router();

router.get("/", getCategories);
router.get("/:category_name", getCategoryByCategoryName);
router.post("/", addCategory);
router.put("/:category_id", updateCategory);
router.delete("/:category_id", deleteCategory);

export default router;
