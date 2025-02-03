import express from "express";
import {
  getProductModels,
  addProductModel,
} from "../controllers/productModelController";

const router = express.Router();

router.get("/", getProductModels);
router.post("/newProductModel", addProductModel);

export default router;
