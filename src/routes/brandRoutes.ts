import express from "express";
import {
  getBrands,
  addBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController";

const router = express.Router();

router.get("/", getBrands);
router.post("/", addBrand);
router.put("/:brand_id", updateBrand);
router.delete("/:brand_id", deleteBrand);

export default router;
