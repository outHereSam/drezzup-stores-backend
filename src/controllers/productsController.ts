import { Request, Response } from "express";
import pool from "../config/db";
import {
  getProducts,
  getProductById,
  insertProductModel,
  getOrCreateTag,
  insertProduct,
  insertProductVariant,
  insertImageAndLink,
  Product,
  updateProductById,
  deleteProductById,
  getProductsByCategoryId,
  getProductVariants,
  updateProductVariant,
  deleteProductVariant,
} from "../models/product.model";
import { updateProductModelById } from "../models/productModel.model";
import { uploadToS3 } from "../services/s3Service";

export const addProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Extract fields from the request body (sent as multipart/form-data)
  const {
    category, // Category ID as string
    brand, // Brand ID as string
    model, // Product model name
    description, // Model description
    color,
    size,
    quantity,
    price,
    tag, // Optional tag name (e.g., "featured")
  } = req.body;

  // Files uploaded via Multer will be in req.files
  const files = req.files as Express.Multer.File[];

  // console.log("Data from front-end:", req.body);
  // console.log("Image files:", files);

  // Validate required fields
  if (!category || !brand || !model || !color || !size || !quantity || !price) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    // Begin a transaction
    await pool.query("BEGIN");

    // 1. Create the product model and get its ID.
    const productModelId = await insertProductModel(model, description);

    // 2. Handle the tag (if provided): get or create the tag, then retrieve its ID.
    const tagId = await getOrCreateTag(tag);

    // 3. Create the product record.
    const newProduct: Product = await insertProduct(
      parseInt(category, 10),
      parseInt(brand, 10),
      productModelId,
      tagId,
      parseFloat(price)
    );

    // 4. Create the product variant.
    await insertProductVariant(
      newProduct.product_id,
      color,
      size,
      parseInt(quantity, 10)
    );

    // 5. Process image uploads: upload each file to S3, then insert image record and link it.
    const s3ImageUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const fileUrl = await uploadToS3(file);
        s3ImageUrls.push(fileUrl);
        await insertImageAndLink(newProduct.product_id, fileUrl);
      }
    }

    // Commit the transaction
    await pool.query("COMMIT");

    res.status(201).json({
      product: newProduct,
      images: s3ImageUrls,
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await getProducts();

    res.status(200).json(products);
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).json({ error: "Failed to retrieve products" });
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = parseInt(req.params.category_id, 10);
    if (isNaN(categoryId)) {
      res.status(400).json({ error: "Invalid category ID" });
      return;
    }
    const products = await getProductsByCategoryId(categoryId);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).json({ error: "Failed to retrieve products" });
  }
};

export const getProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productId = parseInt(req.params.product_id, 10);
    if (isNaN(productId)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }
    const product: Product | null = await getProductById(productId);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error retrieving product:", error);
    res.status(500).json({ error: "Failed to retrieve product" });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productId = parseInt(req.params.product_id, 10);
    if (isNaN(productId)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }

    // Extract data from request body
    const {
      category,
      brand,
      product_model_id,
      tag,
      price,
      model_name,
      model_description,
      variants,
    } = req.body;

    // Begin transaction
    await pool.query("BEGIN");

    // 1. Update product model if provided
    if (model_name && model_description) {
      await updateProductModelById(
        parseInt(product_model_id, 10),
        model_name,
        model_description
      );
    }

    // 2. Update the product
    const updatedProduct: Product | null = await updateProductById(
      productId,
      parseInt(category, 10),
      parseInt(brand, 10),
      parseInt(product_model_id, 10),
      tag ? parseInt(tag, 10) : null,
      parseFloat(price)
    );

    if (!updatedProduct) {
      await pool.query("ROLLBACK");
      res.status(404).json({ error: "Product not found or update failed" });
      return;
    }

    // 3. Handle variants if provided
    if (variants && Array.isArray(variants)) {
      // First, get existing variants
      const existingVariants = await getProductVariants(productId);

      // Update or create variants
      for (const variant of variants) {
        if (variant.variant_id) {
          // Update existing variant
          await updateProductVariant(
            variant.variant_id,
            variant.color,
            variant.size,
            variant.quantity
          );
        } else {
          // Create new variant
          await insertProductVariant(
            productId,
            variant.color,
            variant.size,
            variant.quantity
          );
        }
      }

      // Delete variants that are no longer in the list
      const variantIdsToKeep = variants
        .filter((v) => v.variant_id)
        .map((v) => v.variant_id);

      for (const existingVariant of existingVariants) {
        if (!variantIdsToKeep.includes(existingVariant.variant_id)) {
          await deleteProductVariant(existingVariant.variant_id);
        }
      }
    }

    // 4. Handle images if provided (similar to variants)
    // ...

    // Commit transaction
    await pool.query("COMMIT");

    // Return updated product with all related data
    const completeProduct = await getProductById(productId);
    res.status(200).json(completeProduct);
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productId = parseInt(req.params.product_id, 10);
    if (isNaN(productId)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }
    const success = await deleteProductById(productId);
    if (!success) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};
