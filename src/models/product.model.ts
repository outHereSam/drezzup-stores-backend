import pool from "../config/db";

export interface Product {
  product_id: number;
  category_id: number;
  brand_id: number;
  product_model_id: number;
  tag_id: number | null;
  price: number;
  date_added: Date;
}

export interface ProductVariant {
  variant_id: number;
  product_id: number;
  color: string;
  size: string;
  quantity: number;
}

export interface Image {
  image_id: number;
  image_url: string;
}

export interface Tag {
  tag_id: number;
  tag_name: string;
}

// --- FUNCTIONS ---

// Insert a new product model into product_models table and return its ID.
export const insertProductModel = async (
  modelName: string,
  modelDescription: string
): Promise<number> => {
  const result = await pool.query(
    `INSERT INTO product_models (model_name, description)
     VALUES ($1, $2)
     RETURNING product_model_id`,
    [modelName, modelDescription]
  );
  return result.rows[0].product_model_id;
};

// Check if a tag exists; if not, create it. Return the tag_id (or null if tagName is empty).
export const getOrCreateTag = async (
  tagName: string
): Promise<number | null> => {
  if (!tagName || tagName.trim() === "") {
    return null;
  }
  const tagResult = await pool.query(
    "SELECT tag_id FROM tag WHERE tag_name = $1",
    [tagName]
  );
  if (tagResult.rows.length > 0) {
    return tagResult.rows[0].tag_id;
  } else {
    const newTagResult = await pool.query(
      "INSERT INTO tag (tag_name) VALUES ($1) RETURNING tag_id",
      [tagName]
    );
    return newTagResult.rows[0].tag_id;
  }
};

// Insert a new product record into products table.
export const insertProduct = async (
  categoryId: number,
  brandId: number,
  productModelId: number,
  tagId: number | null,
  price: number
): Promise<Product> => {
  const result = await pool.query(
    `INSERT INTO products (category_id, brand_id, product_model_id, tag_id, price)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [categoryId, brandId, productModelId, tagId, price]
  );
  return result.rows[0];
};

// Insert a new product variant into product_variants table.
export const insertProductVariant = async (
  productId: number,
  color: string,
  size: string,
  quantity: number
): Promise<ProductVariant> => {
  const result = await pool.query(
    `INSERT INTO product_variants (product_id, color, size, quantity)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [productId, color, size, quantity]
  );
  return result.rows[0];
};

// Insert an image into the images table and then link it in product_image table.
export const insertImageAndLink = async (
  productId: number,
  imageUrl: string
): Promise<void> => {
  const imageResult = await pool.query(
    "INSERT INTO images (image_url) VALUES ($1) RETURNING image_id",
    [imageUrl]
  );
  const imageId = imageResult.rows[0].image_id;
  await pool.query(
    "INSERT INTO product_images (product_id, image_id) VALUES ($1, $2)",
    [productId, imageId]
  );
};

export const getProducts = async (): Promise<Product[]> => {
  const query = `
    SELECT
      MIN(p.product_id) AS product_id,
      p.category_id,
      c.category_name,
      p.brand_id,
      b.brand_name,
      p.product_model_id,
      pm.model_name,
      pm.description AS model_description,
      p.tag_id,
      t.tag_name,
      p.price,
      p.date_added,
      json_agg(
        json_build_object(
          'variant_id', pv.variant_id,
          'color', pv.color,
          'size', pv.size,
          'quantity', pv.quantity
        )
      ) AS variants,
      (
        SELECT json_agg(i.image_url)
        FROM product_images pi
        JOIN images i ON pi.image_id = i.image_id
        WHERE pi.product_id = MIN(p.product_id)
      ) AS images
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    JOIN brands b ON p.brand_id = b.brand_id
    JOIN product_models pm ON p.product_model_id = pm.product_model_id
    LEFT JOIN tag t ON p.tag_id = t.tag_id
    LEFT JOIN product_variants pv ON p.product_id = pv.product_id
    GROUP BY p.category_id, c.category_name, p.brand_id, b.brand_name,
             p.product_model_id, pm.model_name, pm.description, p.tag_id, t.tag_name, p.price, p.date_added
    ORDER BY product_id ASC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getProductsByCategoryId = async (
  categoryId: number
): Promise<Product[]> => {
  const query = `
    SELECT
      MIN(p.product_id) AS product_id,
      p.category_id,
      c.category_name,
      p.brand_id,
      b.brand_name,
      p.product_model_id,
      pm.model_name,
      pm.description AS model_description,
      p.tag_id,
      t.tag_name,
      p.price,
      p.date_added,
      json_agg(
        json_build_object(
          'variant_id', pv.variant_id,
          'color', pv.color,
          'size', pv.size,
          'quantity', pv.quantity
        )
      ) AS variants,
      (
        SELECT json_agg(i.image_url)
        FROM product_images pi
        JOIN images i ON pi.image_id = i.image_id
        WHERE pi.product_id = MIN(p.product_id)
      ) AS images
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    JOIN brands b ON p.brand_id = b.brand_id
    JOIN product_models pm ON p.product_model_id = pm.product_model_id
    LEFT JOIN tag t ON p.tag_id = t.tag_id
    LEFT JOIN product_variants pv ON p.product_id = pv.product_id
    WHERE p.category_id = $1
    GROUP BY p.category_id, c.category_name, p.brand_id, b.brand_name,
             p.product_model_id, pm.model_name, pm.description, p.tag_id, t.tag_name, p.price, p.date_added
    ORDER BY product_id ASC;
  `;
  const result = await pool.query(query, [categoryId]);
  return result.rows;
};

export const getProductById = async (
  productId: number
): Promise<Product | null> => {
  const query = `
    SELECT
      p.product_id,
      p.category_id,
      c.category_name,
      p.brand_id,
      b.brand_name,
      p.product_model_id,
      pm.model_name,
      pm.description AS model_description,
      p.tag_id,
      t.tag_name,
      p.price,
      p.date_added,
      json_agg(
        json_build_object(
          'variant_id', pv.variant_id,
          'color', pv.color,
          'size', pv.size,
          'quantity', pv.quantity
        )
      ) AS variants,
      (
        SELECT json_agg(i.image_url)
        FROM product_images pi
        JOIN images i ON pi.image_id = i.image_id
        WHERE pi.product_id = p.product_id
      ) AS images
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    JOIN brands b ON p.brand_id = b.brand_id
    JOIN product_models pm ON p.product_model_id = pm.product_model_id
    LEFT JOIN tag t ON p.tag_id = t.tag_id
    LEFT JOIN product_variants pv ON p.product_id = pv.product_id
    WHERE p.product_id = $1
    GROUP BY p.product_id, p.category_id, c.category_name,
             p.brand_id, b.brand_name,
             p.product_model_id, pm.model_name, pm.description,
             p.tag_id, t.tag_name, p.price, p.date_added;
  `;
  const result = await pool.query(query, [productId]);
  return result.rows[0] || null;
};

export const createProduct = async (
  category_id: number,
  brand_id: number,
  product_model_id: number,
  tag_id: number | null,
  price: number
): Promise<Product> => {
  const result = await pool.query(
    `INSERT INTO products (category_id, brand_id, product_model_id, tag_id, price)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [category_id, brand_id, product_model_id, tag_id, price]
  );
  return result.rows[0];
};

export const updateProductById = async (
  productId: number,
  category_id: number,
  brand_id: number,
  product_model_id: number,
  tag_id: number | null,
  price: number
): Promise<Product | null> => {
  const query = `
    UPDATE products 
    SET category_id = $1, 
        brand_id = $2, 
        product_model_id = $3, 
        tag_id = $4, 
        price = $5
    WHERE product_id = $6
    RETURNING *;
  `;
  const result = await pool.query(query, [
    category_id,
    brand_id,
    product_model_id,
    tag_id,
    price,
    productId,
  ]);
  return result.rows[0] || null;
};

export const deleteProductById = async (
  productId: number
): Promise<boolean> => {
  const query = `
    DELETE FROM products 
    WHERE product_id = $1
    RETURNING *;
  `;
  const result = await pool.query(query, [productId]);
  return result.rowCount !== null && result.rowCount > 0;
};

export const createProductVariant = async (
  product_id: number,
  color: string,
  size: string,
  quantity: number
): Promise<ProductVariant> => {
  const result = await pool.query(
    `INSERT INTO product_variants (product_id, color, size, quantity)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [product_id, color, size, quantity]
  );
  return result.rows[0];
};

export const createImage = async (image_url: string): Promise<number> => {
  const result = await pool.query(
    `INSERT INTO images (image_url) VALUES ($1) RETURNING image_id`,
    [image_url]
  );
  return result.rows[0].image_id;
};

export const createProductImage = async (
  product_id: number,
  image_id: number
): Promise<void> => {
  await pool.query(
    `INSERT INTO product_images (product_id, image_id) VALUES ($1, $2)`,
    [product_id, image_id]
  );
};

// Get all variants for a product
export const getProductVariants = async (
  productId: number
): Promise<ProductVariant[]> => {
  const result = await pool.query(
    `SELECT * FROM product_variants WHERE product_id = $1`,
    [productId]
  );
  return result.rows;
};

// Update an existing product variant
export const updateProductVariant = async (
  variantId: number,
  color: string,
  size: string,
  quantity: number
): Promise<ProductVariant> => {
  const result = await pool.query(
    `UPDATE product_variants 
     SET color = $1, size = $2, quantity = $3
     WHERE variant_id = $4
     RETURNING *`,
    [color, size, quantity, variantId]
  );
  return result.rows[0];
};

// Delete a product variant
export const deleteProductVariant = async (
  variantId: number
): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM product_variants WHERE variant_id = $1 RETURNING *`,
    [variantId]
  );
  return result.rowCount !== null && result.rowCount > 0;
};

export const getTags = async (): Promise<Tag[] | null> => {
  const result = await pool.query("SELECT tag_id, tag_name FROM tag");
  return result.rows;
};

export const updateProductTagById = async (
  product_id: number,
  tag_id: number
) => {
  const query = `
      UPDATE products
      SET tag_id = $1
      WHERE product_id = $2
      RETURNING *;
    `;
  const result = await pool.query(query, [tag_id, product_id]);

  return result.rowCount !== null && result.rowCount > 0;
};
