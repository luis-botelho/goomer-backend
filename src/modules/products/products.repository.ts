import { pool } from '../../db/pool.js';

export type ProductCategory =
  | 'STARTER'
  | 'MAIN_COURSE'
  | 'DESSERT'
  | 'BEVERAGE';

export interface CreateProductRecord {
  name: string;
  price: number;
  category: ProductCategory;
  visible: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  category: ProductCategory;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProductRecord {
  name?: string;
  price?: number;
  category?: ProductCategory;
  visible?: boolean;
}

export async function createProduct(
  data: CreateProductRecord,
): Promise<Product> {
  const query = `
    INSERT INTO products (
      name,
      price,
      category,
      visible
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      name,
      price,
      category,
      visible,
      created_at AS "createdAt",
      updated_at AS "updatedAt";
  `;

  const values = [
    data.name,
    data.price,
    data.category,
    data.visible,
  ];

  const result = await pool.query<Product>(query, values);

  return result.rows[0];
}

export async function findAllProducts(): Promise<Product[]> {
  const query = `
    SELECT
      id,
      name,
      price,
      category,
      visible,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM products;
  `;

  const result = await pool.query<Product>(query);

  return result.rows;
}

export async function findProductById(
  id: string,
): Promise<Product | null> {
  const query = `
    SELECT
      id,
      name,
      price,
      category,
      visible,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM products
    WHERE id = $1;
  `;

  const result = await pool.query<Product>(query, [id]);

  return result.rows[0] ?? null;
}

export async function updateProduct(
  id: string,
  data: UpdateProductRecord,
): Promise<Product | null> {
  const query = `
    UPDATE products
    SET
      name = COALESCE($2, name),
      price = COALESCE($3, price),
      category = COALESCE($4, category),
      visible = COALESCE($5, visible),
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      name,
      price,
      category,
      visible,
      created_at AS "createdAt",
      updated_at AS "updatedAt";
  `;

  const values = [
    id,
    data.name ?? null,
    data.price ?? null,
    data.category ?? null,
    data.visible ?? null,
  ];

  const result = await pool.query<Product>(query, values);

  return result.rows[0] ?? null;
}

export async function deleteProduct(
  id: string,
): Promise<boolean> {
  const query = `
    DELETE FROM products
    WHERE id = $1
    RETURNING id;
  `;

  const result = await pool.query(query, [id]);

  return (result.rowCount ?? 0) > 0;
}
