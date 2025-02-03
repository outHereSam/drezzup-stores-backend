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
