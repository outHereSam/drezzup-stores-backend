import express from "express";
import { getBrands, addBrand } from "../controllers/brandController";

const router = express.Router();

router.get("/", getBrands);
router.post("/newBrand", addBrand);

export default router;
