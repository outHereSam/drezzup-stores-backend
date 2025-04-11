import express from "express";
import {
  getProductModels,
  addProductModel,
  updateProductModel,
  deleteProductModel,
} from "../controllers/productModelController";

const router = express.Router();

router.get("/", getProductModels);
router.post("/", addProductModel);
router.put("/:product_model_id", updateProductModel);
router.delete("/:product_model_id", deleteProductModel);

export default router;
