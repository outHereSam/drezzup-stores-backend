import { Request, Response } from "express";
import {
  getAllProductModels,
  createProductModel,
  ProductModel,
  getProductModelById,
  updateProductModelById,
  deleteProductModelById,
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

export const updateProductModel = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { product_model_id } = req.params;
  const { model_name, description } = req.body;

  if (!product_model_id) {
    res.status(400).json({ error: "Product model id is required" });
    return;
  }
  if (!model_name) {
    res.status(400).json({ error: "Model name is required" });
    return;
  }

  try {
    const parsedId = parseInt(product_model_id, 10);
    const existingModel: ProductModel = await getProductModelById(parsedId);
    if (!existingModel) {
      res.status(404).json({ error: "Product model not found" });
      return;
    }
    const updatedModel: ProductModel = await updateProductModelById(
      parsedId,
      model_name,
      description || null
    );
    res.status(200).json(updatedModel);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product model" });
  }
};

export const deleteProductModel = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { product_model_id } = req.params;

  if (!product_model_id) {
    res.status(400).json({ error: "Product model id is required" });
    return;
  }

  try {
    const parsedId = parseInt(product_model_id, 10);
    const existingModel: ProductModel = await getProductModelById(parsedId);
    if (!existingModel) {
      res.status(404).json({ error: "Product model not found" });
      return;
    }
    await deleteProductModelById(parsedId);
    res.status(200).json({ message: "Product model deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product model" });
  }
};
