import pool from "../config/db";

export interface Category {
  id: number;
  category_name: string;
}

export const getAllCategories = async (): Promise<Category[]> => {
  const result = await pool.query("SELECT * FROM Category");
  return result.rows;
};

export const createCategory = async (
  categoryName: string
): Promise<Category> => {
  const result = await pool.query(
    "INSERT INTO Category (category_name) VALUES ($1) RETURNING *",
    [categoryName]
  );
  return result.rows[0];
};
