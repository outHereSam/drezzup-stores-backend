import pool from "../config/db";

export interface ProductModel {
  id: number;
  model_name: string;
  brand_id: number;
}

export const getAllProductModels = async (): Promise<ProductModel[]> => {
  const result = await pool.query("SELECT * FROM product_models");
  return result.rows;
};

export const getProductModelById = async (
  productModelId: number
): Promise<ProductModel> => {
  const result = await pool.query(
    "SELECT * FROM product_models WHERE product_model_id = $1",
    [productModelId]
  );
  return result.rows[0];
};

export const createProductModel = async (
  model_name: string,
  brand_id: number
): Promise<ProductModel> => {
  const result = await pool.query(
    "INSERT INTO product_models (model_name, brand_id) VALUES ($1, $2) RETURNING *",
    [model_name, brand_id]
  );
  return result.rows[0];
};

export const updateProductModelById = async (
  productModelId: number,
  model_name: string,
  description: string | null
): Promise<ProductModel> => {
  const result = await pool.query(
    "UPDATE Product_Models SET model_name = $1, description = $2 WHERE product_model_id = $3 RETURNING *",
    [model_name, description, productModelId]
  );
  return result.rows[0];
};

export const deleteProductModelById = async (
  productModelId: number
): Promise<boolean> => {
  try {
    const result = await pool.query(
      "DELETE FROM Product_Models WHERE product_model_id = $1 RETURNING *",
      [productModelId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error("Error deleting brand:", error);
    throw error;
  }
};
