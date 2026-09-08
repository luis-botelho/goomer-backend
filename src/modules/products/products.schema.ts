import { Static, Type } from '@sinclair/typebox';

export const ProductCategorySchema = Type.Union([
  Type.Literal('STARTER'),
  Type.Literal('MAIN_COURSE'),
  Type.Literal('DESSERT'),
  Type.Literal('BEVERAGE'),
]);

export const CreateProductBodySchema = Type.Object(
  {
    name: Type.String({
      minLength: 1,
      maxLength: 255,
    }),

    price: Type.Number({
      exclusiveMinimum: 0,
    }),

    category: ProductCategorySchema,

    visible: Type.Optional(Type.Boolean()),
  },
  {
    additionalProperties: false,
  },
);

export const ProductParamsSchema = Type.Object(
  {
    id: Type.String({
      format: 'uuid',
    }),
  },
  {
    additionalProperties: false,
  },
);

export const UpdateProductBodySchema = Type.Object(
  {
    name: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 255,
      }),
    ),

    price: Type.Optional(
      Type.Number({
        exclusiveMinimum: 0,
      }),
    ),

    category: Type.Optional(ProductCategorySchema),

    visible: Type.Optional(Type.Boolean()),
  },
  {
    additionalProperties: false,
    minProperties: 1,
  },
);

export type UpdateProductBody = Static<
  typeof UpdateProductBodySchema
>;

export type ProductParams = Static<typeof ProductParamsSchema>;

export type CreateProductBody = Static<typeof CreateProductBodySchema>;