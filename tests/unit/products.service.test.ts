import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/modules/products/products.repository.js', () => ({
  createProduct: vi.fn(),
  findAllProducts: vi.fn(),
  findProductById: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

import {
  createProduct,
  deleteProduct,
  findAllProducts,
  findProductById,
  updateProduct,
  type Product,
} from '../../src/modules/products/products.repository.js';

import {
  createProductService,
  deleteProductService,
  getProductByIdService,
  listProductsService,
  updateProductService,
} from '../../src/modules/products/products.service.js';

import { NotFoundError } from '../../src/shared/errors/not-found-error.js';

const productId = '550e8400-e29b-41d4-a716-446655440000';

const product: Product = {
  id: productId,
  name: 'Chopp',
  price: '12.00',
  category: 'BEVERAGE',
  visible: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('createProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a product defaulting to visible when not provided', async () => {
    vi.mocked(createProduct).mockResolvedValue(product);

    const result = await createProductService({
      name: 'Chopp',
      price: 12,
      category: 'BEVERAGE',
    });

    expect(createProduct).toHaveBeenCalledWith({
      name: 'Chopp',
      price: 12,
      category: 'BEVERAGE',
      visible: true,
    });
    expect(result).toEqual(product);
  });

  it('keeps the provided visibility flag', async () => {
    vi.mocked(createProduct).mockResolvedValue({
      ...product,
      visible: false,
    });

    await createProductService({
      name: 'Chopp',
      price: 12,
      category: 'BEVERAGE',
      visible: false,
    });

    expect(createProduct).toHaveBeenCalledWith(
      expect.objectContaining({ visible: false }),
    );
  });
});

describe('getProductByIdService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the product when it exists', async () => {
    vi.mocked(findProductById).mockResolvedValue(product);

    const result = await getProductByIdService(productId);

    expect(findProductById).toHaveBeenCalledWith(productId);
    expect(result).toEqual(product);
  });

  it('throws NotFoundError when the product does not exist', async () => {
    vi.mocked(findProductById).mockResolvedValue(null);

    await expect(getProductByIdService(productId)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});

describe('listProductsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all products', async () => {
    vi.mocked(findAllProducts).mockResolvedValue([product]);

    const result = await listProductsService();

    expect(result).toEqual([product]);
  });
});

describe('updateProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws NotFoundError when the product does not exist', async () => {
    vi.mocked(updateProduct).mockResolvedValue(null);

    await expect(
      updateProductService(productId, { name: 'Nova' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('updates and returns the product', async () => {
    vi.mocked(updateProduct).mockResolvedValue({
      ...product,
      name: 'Nova',
    });

    const result = await updateProductService(productId, {
      name: 'Nova',
    });

    expect(updateProduct).toHaveBeenCalledWith(productId, {
      name: 'Nova',
      price: undefined,
      category: undefined,
      visible: undefined,
    });
    expect(result.name).toBe('Nova');
  });
});

describe('deleteProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws NotFoundError when the product does not exist', async () => {
    vi.mocked(deleteProduct).mockResolvedValue(false);

    await expect(deleteProductService(productId)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('resolves when the product is deleted', async () => {
    vi.mocked(deleteProduct).mockResolvedValue(true);

    await expect(deleteProductService(productId)).resolves.toBeUndefined();
  });
});