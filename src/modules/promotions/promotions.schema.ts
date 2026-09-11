import { Static, Type } from '@sinclair/typebox';

export const TimeStringSchema = Type.String({
  pattern: '^([01]\\d|2[0-3]):[0-5]\\d$',
});

export const PromotionScheduleSchema = Type.Object(
  {
    weekday: Type.Integer({
      minimum: 0,
      maximum: 6,
    }),

    startTime: TimeStringSchema,
    endTime: TimeStringSchema,
  },
  {
    additionalProperties: false,
  },
);

export const CreatePromotionBodySchema = Type.Object(
  {
    productId: Type.String({
      format: 'uuid',
    }),

    description: Type.String({
      minLength: 1,
      maxLength: 255,
    }),

    promotionalPrice: Type.Number({
      exclusiveMinimum: 0,
    }),

    schedules: Type.Array(PromotionScheduleSchema, {
      minItems: 1,
    }),
  },
  {
    additionalProperties: false,
  },
);

export const PromotionParamsSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid',
    }),
  },
  {
    additionalProperties: false,
  },
);

export const UpdatePromotionBodySchema = Type.Object(
  {
    description: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 255,
      }),
    ),

    promotionalPrice: Type.Optional(
      Type.Number({
        exclusiveMinimum: 0,
      }),
    ),

    schedules: Type.Optional(
      Type.Array(PromotionScheduleSchema, {
        minItems: 1,
      }),
    ),
  },
  {
    additionalProperties: false,
    minProperties: 1,
  },
);

export type CreatePromotionBody = Static<
  typeof CreatePromotionBodySchema
>;

export type UpdatePromotionBody = Static<
  typeof UpdatePromotionBodySchema
>;

export type PromotionParams = Static<typeof PromotionParamsSchema>;

export type PromotionScheduleInput = Static<
  typeof PromotionScheduleSchema
>;