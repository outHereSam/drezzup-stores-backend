import { Request, Response } from "express";
import {
  getAllBrands,
  createBrand,
  getBrandById,
  updateBrandById,
  deleteBrandById,
} from "../models/brand.model";

export const getBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const brands = await getAllBrands();
    res.json({ brands });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch brands" });
  }
};

export const addBrand = async (req: Request, res: Response): Promise<void> => {
  const { brand_name } = req.body;

  if (!brand_name) {
    res.status(400).json({ error: "Brand name is required" });
    return;
  }

  try {
    const newBrand = await createBrand(brand_name);
    res.status(201).json({
      message: "Brand created successfully",
      brand: newBrand,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create brand" });
  }
};

export const updateBrand = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { brand_id } = req.params;
  const { product_name } = req.body;

  if (!brand_id) {
    res.status(400).json({ error: "Brand id is required" });
    return;
  }
  if (!product_name) {
    res.status(400).json({ error: "Brand name is required" });
    return;
  }

  try {
    const parsedId = parseInt(brand_id, 10);
    const existingBrand = await getBrandById(parsedId);
    if (!existingBrand) {
      res.status(404).json({ error: "Brand does not exist" });
      return;
    }
    const updatedBrand = await updateBrandById(parsedId, product_name);
    res.status(200).json(updatedBrand);
  } catch (error) {
    res.status(500).json({ error: "Failed to update brand" });
  }
};

export const deleteBrand = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { brand_id } = req.params;

  if (!brand_id) {
    res.status(400).json({ error: "Brand id is required" });
    return;
  }

  try {
    const parsedId = parseInt(brand_id, 10);
    const existingBrand = await getBrandById(parsedId);
    if (!existingBrand) {
      res.status(404).json({ error: "Brand does not exist" });
      return;
    }
    await deleteBrandById(parsedId);
    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete brand" });
  }
};
