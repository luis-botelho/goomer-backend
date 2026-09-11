import type { ProductCategory } from '../products/products.repository.js';
import { findMenuData } from './menu.repository.js';

export interface MenuItem {
  id: string;
  name: string;
  price: string;
  category: ProductCategory;
  currentPrice: string;
  promotion: {
    description: string;
    promotionalPrice: string;
  } | null;
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

export async function getMenuService(
  now: Date = new Date(),
): Promise<MenuItem[]> {
  const weekday = now.getDay();
  const time = formatTime(now);

  const rows = await findMenuData(weekday, time);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    price: row.price,
    category: row.category,
    currentPrice: row.currentPrice,
    promotion: row.promotionDescription
      ? {
          description: row.promotionDescription,
          promotionalPrice: row.promotionPrice as string,
        }
      : null,
  }));
}