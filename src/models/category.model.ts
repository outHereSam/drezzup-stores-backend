import pool from "../config/db";

export interface Category {
  id: number;
  category_name: string;
}

export const getAllCategories = async (): Promise<Category[]> => {
  const result = await pool.query("SELECT * FROM categories");
  return result.rows;
};

export const getCategoryByName = async (
  categoryName: string
): Promise<Category> => {
  const result = await pool.query(
    "SELECT * FROM categories WHERE category_name = $1",
    [categoryName]
  );
  return result.rows[0];
};

export const createCategory = async (
  categoryName: string
): Promise<Category> => {
  const result = await pool.query(
    "INSERT INTO categories (category_name) VALUES ($1) RETURNING *",
    [categoryName]
  );
  return result.rows[0];
};

export const getCategoryById = async (
  categoryId: number
): Promise<Category> => {
  const result = await pool.query(
    "SELECT * FROM categories WHERE category_id = $1",
    [categoryId]
  );
  return result.rows[0];
};

export const updateCategoryById = async (
  categoryId: number,
  categoryName: string
): Promise<Category> => {
  const result = await pool.query(
    "UPDATE categories SET category_name = $1 WHERE category_id = $2 RETURNING *",
    [categoryName, categoryId]
  );
  return result.rows[0];
};

export const deleteCategoryById = async (
  categoryId: number
): Promise<boolean> => {
  try {
    const result = await pool.query(
      "DELETE FROM categories WHERE category_id = $1 RETURNING *",
      [categoryId]
    );

    // Return true if a row was deleted, false if no matching record was found
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error; // Re-throw to handle it in the calling function
  }
};
