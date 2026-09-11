import type { Pool, PoolClient } from 'pg';

import { pool } from '../../db/pool.js';

export interface PromotionSchedule {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
}

export interface Promotion {
  id: string;
  productId: string;
  description: string;
  promotionalPrice: string;
  schedules: PromotionSchedule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PromotionScheduleInput {
  weekday: number;
  startTime: string;
  endTime: string;
}

export interface CreatePromotionRecord {
  productId: string;
  description: string;
  promotionalPrice: number;
  schedules: PromotionScheduleInput[];
}

export interface UpdatePromotionRecord {
  description?: string;
  promotionalPrice?: number;
  schedules?: PromotionScheduleInput[];
}

interface PromotionRow {
  id: string;
  productId: string;
  description: string;
  promotionalPrice: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PromotionScheduleRow extends PromotionSchedule {
  promotionId: string;
}

type Queryable = Pool | PoolClient;

const promotionSelect = [
  'id',
  'product_id AS "productId"',
  'description',
  'promotional_price AS "promotionalPrice"',
  'created_at AS "createdAt"',
  'updated_at AS "updatedAt"',
].join(', ');

const scheduleSelect = [
  'id',
  'weekday',
  "TO_CHAR(start_time, 'HH24:MI') AS \"startTime\"",
  "TO_CHAR(end_time, 'HH24:MI') AS \"endTime\"",
].join(', ');

async function selectSchedules(
  client: Queryable,
  promotionId: string,
): Promise<PromotionSchedule[]> {
  const result = await client.query<PromotionSchedule>(
    `
      SELECT
        ${scheduleSelect}
      FROM promotion_schedules
      WHERE promotion_id = $1
      ORDER BY weekday ASC, start_time ASC;
    `,
    [promotionId],
  );

  return result.rows;
}

async function insertSchedules(
  client: Queryable,
  promotionId: string,
  schedules: PromotionScheduleInput[],
): Promise<PromotionSchedule[]> {
  const inserted: PromotionSchedule[] = [];

  for (const schedule of schedules) {
    const result = await client.query<PromotionSchedule>(
      `
        INSERT INTO promotion_schedules (
          promotion_id,
          weekday,
          start_time,
          end_time
        )
        VALUES ($1, $2, $3::time, $4::time)
        RETURNING
          ${scheduleSelect};
      `,
      [
        promotionId,
        schedule.weekday,
        schedule.startTime,
        schedule.endTime,
      ],
    );

    inserted.push(result.rows[0]);
  }

  return inserted;
}

export async function createPromotionWithSchedules(
  data: CreatePromotionRecord,
): Promise<Promotion> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const promotionResult = await client.query<PromotionRow>(
      `
        INSERT INTO promotions (
          product_id,
          description,
          promotional_price
        )
        VALUES ($1, $2, $3)
        RETURNING
          ${promotionSelect};
      `,
      [data.productId, data.description, data.promotionalPrice],
    );

    const promotion = promotionResult.rows[0];

    const schedules = await insertSchedules(
      client,
      promotion.id,
      data.schedules,
    );

    await client.query('COMMIT');

    return { ...promotion, schedules };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function findAllPromotions(): Promise<Promotion[]> {
  const result = await pool.query<PromotionRow>(
    `
      SELECT
        ${promotionSelect}
      FROM promotions
      ORDER BY created_at ASC;
    `,
  );

  const promotions = result.rows;

  if (promotions.length === 0) {
    return [];
  }

  const schedulesResult = await pool.query<PromotionScheduleRow>(
    `
      SELECT
        promotion_id AS "promotionId",
        ${scheduleSelect}
      FROM promotion_schedules
      WHERE promotion_id = ANY($1::uuid[])
      ORDER BY weekday ASC, start_time ASC;
    `,
    [promotions.map((promotion) => promotion.id)],
  );

  const schedulesByPromotion = new Map<string, PromotionSchedule[]>();

  for (const row of schedulesResult.rows) {
    const list = schedulesByPromotion.get(row.promotionId) ?? [];

    list.push({
      id: row.id,
      weekday: row.weekday,
      startTime: row.startTime,
      endTime: row.endTime,
    });

    schedulesByPromotion.set(row.promotionId, list);
  }

  return promotions.map((promotion) => ({
    ...promotion,
    schedules: schedulesByPromotion.get(promotion.id) ?? [],
  }));
}

export async function findPromotionById(
  id: string,
): Promise<Promotion | null> {
  const result = await pool.query<PromotionRow>(
    `
      SELECT
        ${promotionSelect}
      FROM promotions
      WHERE id = $1;
    `,
    [id],
  );

  const promotion = result.rows[0];

  if (!promotion) {
    return null;
  }

  const schedules = await selectSchedules(pool, promotion.id);

  return { ...promotion, schedules };
}

export async function updatePromotion(
  id: string,
  data: UpdatePromotionRecord,
): Promise<Promotion | null> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const promotionResult = await client.query<PromotionRow>(
      `
        UPDATE promotions
        SET
          description = COALESCE($2, description),
          promotional_price = COALESCE($3, promotional_price),
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          ${promotionSelect};
      `,
      [id, data.description ?? null, data.promotionalPrice ?? null],
    );

    const promotion = promotionResult.rows[0];

    if (!promotion) {
      await client.query('ROLLBACK');
      return null;
    }

    let schedules: PromotionSchedule[];

    if (data.schedules) {
      await client.query(
        `
          DELETE FROM promotion_schedules
          WHERE promotion_id = $1;
        `,
        [id],
      );

      schedules = await insertSchedules(client, id, data.schedules);
    } else {
      schedules = await selectSchedules(client, id);
    }

    await client.query('COMMIT');

    return { ...promotion, schedules };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function deletePromotion(
  id: string,
): Promise<boolean> {
  const result = await pool.query(
    `
      DELETE FROM promotions
      WHERE id = $1
      RETURNING id;
    `,
    [id],
  );

  return (result.rowCount ?? 0) > 0;
}