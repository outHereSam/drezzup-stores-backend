import { Request, Response } from "express";
import {
  getAllCategories,
  createCategory,
  getCategoryById,
  deleteCategoryById,
  updateCategoryById,
} from "../models/category.model";
import { getCategoryByName } from "../models/category.model";

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
    const existingCategory = await getCategoryByName(category_name);
    if (existingCategory) {
      res.status(400).json({ error: "Category already exists" });
      return;
    }

    const newCategory = await createCategory(category_name);
    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
};

export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category_id } = req.params;
  const { category_name } = req.body;

  if (!category_id) {
    res.status(400).json({ error: "Category id is required" });
    return;
  }

  if (!category_name) {
    res.status(400).json({ error: "Category name is required" });
    return;
  }

  try {
    const parsedId = parseInt(category_id, 10);
    // Check if the category exists
    const existingCategory = await getCategoryById(parsedId);
    if (!existingCategory) {
      res.status(404).json({ error: "Category does not exist" });
      return;
    }

    // Update the category using the separated update function
    const updatedCategory = await updateCategoryById(parsedId, category_name);
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category_id } = req.params;

  if (!category_id) {
    res.status(400).json({ error: "Category id is required" });
    return;
  }

  try {
    const parsedId = parseInt(category_id, 10);
    const existingCategory = await getCategoryById(parsedId);
    if (!existingCategory) {
      res.status(404).json({ error: "Category does not exist" });
      return;
    }

    // Delete category
    await deleteCategoryById(parsedId);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
};
