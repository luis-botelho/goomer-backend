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