import { Request, Response } from "express";
import { getAllBrands, createBrand } from "../models/brand.model";

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
