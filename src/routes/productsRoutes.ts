import express from "express";
import {
  getAllProducts,
  addProduct,
  deleteProduct,
  updateProduct,
  getProduct,
  getProductsByCategory,
} from "../controllers/productsController";
import { upload } from "../middlewares/upload";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/category/:category_id", getProductsByCategory);
router.get("/:product_id", getProduct);
router.post("/", upload.array("images", 5), addProduct);
router.put("/:product_id", updateProduct);
router.delete("/:product_id", deleteProduct);

// (Optional) You could also add a PUT endpoint for updating a product.
export default router;
