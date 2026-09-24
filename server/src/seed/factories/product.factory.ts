import { faker } from '@faker-js/faker';
import { PRODUCT_CATEGORIES } from '@shopswift/shared';
import { Product, type IProduct } from '../../models/Product.model';
import { slugify } from '../../utils/slugify';

export async function createProduct(
  teamId: string,
  createdBy: string,
  overrides: Partial<Record<string, unknown>> = {},
): Promise<IProduct> {
  const name = (overrides.name as string) ?? faker.commerce.productName();
  return Product.create({
    team: teamId,
    name,
    slug: (overrides.slug as string) ?? slugify(`${name}-${faker.string.alphanumeric(5)}`),
    description: faker.commerce.productDescription(),
    category: faker.helpers.arrayElement(PRODUCT_CATEGORIES),
    price: faker.number.int({ min: 1500, max: 24999 }),
    stock: faker.number.int({ min: 0, max: 200 }),
    sku: faker.string.alphanumeric(10).toUpperCase(),
    images: [faker.image.urlPicsumPhotos({ width: 800, height: 800 })],
    isFeatured: faker.datatype.boolean({ probability: 0.15 }),
    isActive: true,
    createdBy,
    ...overrides,
  });
}
