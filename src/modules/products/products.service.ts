import type {
  CreateProductBody,
  UpdateProductBody,
} from './products.schema.js';

import {
  createProduct,
  findAllProducts,
  findProductById,
  updateProduct,
  type Product,
  type UpdateProductRecord,
} from './products.repository.js';
import { NotFoundError } from '../../shared/errors/not-found-error.js';

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

export async function getProductByIdService(
  id: string,
): Promise<Product> {
  const product = await findProductById(id);

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  return product;
}

export async function updateProductService(
  id: string,
  input: UpdateProductBody,
): Promise<Product> {
  const data: UpdateProductRecord = {
    name: input.name,
    price: input.price,
    category: input.category,
    visible: input.visible,
  };

  const product = await updateProduct(id, data);

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  return product;
}