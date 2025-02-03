import pool from "../config/db";

export interface Brand {
  id: number;
  brand_name: string;
}

export const getAllBrands = async (): Promise<Brand[]> => {
  const result = await pool.query("SELECT * FROM Brands");
  return result.rows;
};

export const createBrand = async (brand_name: string): Promise<Brand> => {
  const result = await pool.query(
    "INSERT INTO Brands (brand_name) VALUES ($1) RETURNING *",
    [brand_name]
  );
  return result.rows[0];
};
