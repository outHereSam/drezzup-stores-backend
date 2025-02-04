import pool from "../config/db";

export interface Brand {
  id: number;
  brand_name: string;
}

export const getAllBrands = async (): Promise<Brand[]> => {
  const result = await pool.query("SELECT * FROM brands");
  return result.rows;
};

export const getBrandById = async (brandId: number): Promise<Brand> => {
  const result = await pool.query("SELECT * FROM brands WHERE brand_id = $1", [
    brandId,
  ]);
  return result.rows[0];
};

export const createBrand = async (brand_name: string): Promise<Brand> => {
  const result = await pool.query(
    "INSERT INTO brands (brand_name) VALUES ($1) RETURNING *",
    [brand_name]
  );
  return result.rows[0];
};

export const updateBrandById = async (
  brandId: number,
  brandName: string
): Promise<Brand> => {
  const result = await pool.query(
    "UPDATE brands SET product_name = $1 WHERE brand_id = $2 RETURNING *",
    [brandName, brandId]
  );
  return result.rows[0];
};

export const deleteBrandById = async (brandId: number) => {
  try {
    const result = await pool.query(
      "DELETE FROM brands WHERE brand_id = $1 RETURNING *",
      [brandId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error("Error deleting brand:", error);
    throw error;
  }
};
