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

export type CreateProductBody = Static<typeof CreateProductBodySchema>;