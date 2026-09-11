import { pool } from '../../db/pool.js';
import type { ProductCategory } from '../products/products.repository.js';

export interface MenuRow {
  id: string;
  name: string;
  price: string;
  category: ProductCategory;
  currentPrice: string;
  promotionDescription: string | null;
  promotionPrice: string | null;
}

export async function findMenuData(
  weekday: number,
  time: string,
): Promise<MenuRow[]> {
  const query = `
    SELECT
      p.id,
      p.name,
      p.price,
      p.category,
      COALESCE(active.promotional_price, p.price) AS "currentPrice",
      active.description AS "promotionDescription",
      active.promotional_price AS "promotionPrice"
    FROM products p
    LEFT JOIN LATERAL (
      SELECT
        pr.description,
        pr.promotional_price
      FROM promotions pr
      INNER JOIN promotion_schedules ps ON ps.promotion_id = pr.id
      WHERE pr.product_id = p.id
        AND ps.weekday = $1
        AND ps.start_time <= $2::time
        AND ps.end_time > $2::time
      ORDER BY pr.promotional_price ASC, pr.created_at ASC
      LIMIT 1
    ) active ON TRUE
    WHERE p.visible = TRUE
    ORDER BY p.category ASC, p.name ASC;
  `;

  const result = await pool.query<MenuRow>(query, [weekday, time]);

  return result.rows;
}