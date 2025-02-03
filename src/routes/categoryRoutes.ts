import express from "express";
import { getCategories, addCategory } from "../controllers/categoryController";

const router = express.Router();

router.get("/", getCategories);
router.post("/newCategory", addCategory);

export default router;
