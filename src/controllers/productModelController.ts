import { Request, Response } from "express";
import {
  getAllProductModels,
  createProductModel,
} from "../models/productModel.model";

export const getProductModels = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productModels = await getAllProductModels();
    res.json({ productModels });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product models" });
  }
};

export const addProductModel = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { model_name, brand_id } = req.body;

  if (!model_name || !brand_id) {
    res.status(400).json({ error: "Model name and brand ID are required" });
    return;
  }

  try {
    const newProductModel = await createProductModel(model_name, brand_id);
    res.status(201).json({
      message: "Product model created successfully",
      productModel: newProductModel,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create product model" });
  }
};
