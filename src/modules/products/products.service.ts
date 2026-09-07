import type { CreateProductBody } from './products.schema.js';

import {
  createProduct,
  findAllProducts,
  type Product,
} from './products.repository.js';

export async function createProductService(
  input: CreateProductBody,
): Promise<Product> {
  return createProduct({
    name: input.name,
    price: input.price,
    category: input.category,
    visible: input.visible ?? true,
  });
}

export async function listProductsService(): Promise<Product[]> {
  return findAllProducts();
}