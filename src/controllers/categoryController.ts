import { Request, Response } from "express";
import { getAllCategories, createCategory } from "../models/category.model";

export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await getAllCategories();
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export const addCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category_name } = req.body;

  if (!category_name) {
    res.status(400).json({ error: "Category name is required" });
    return;
  }

  try {
    const newCategory = await createCategory(category_name);
    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
};
