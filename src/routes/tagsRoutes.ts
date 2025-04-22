import express from "express";
import { getAllTags } from "../controllers/productsController";

const router = express.Router();

router.get("/", getAllTags);

// (Optional) You could also add a PUT endpoint for updating a product.
export default router;
