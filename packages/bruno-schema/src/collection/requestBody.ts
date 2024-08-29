import { z } from 'zod';

export const formUrlEncodedBodySchema = z.object({
  uid: z.string(),
  name: z.string(),
  value: z.string(),
  description: z.string().default(''),
  enabled: z.boolean()
});
export type FormUrlEncodedBodySchema = z.infer<typeof formUrlEncodedBodySchema>;

export const multipartFormBodySchema = z.discriminatedUnion('type', [
  z.object({
    uid: z.string(),
    name: z.string(),
    type: z.literal('text'),
    value: z.string(),
    description: z.string().default(''),
    enabled: z.boolean()
  }),
  z.object({
    uid: z.string(),
    name: z.string(),
    type: z.literal('file'),
    value: z.array(z.string()),
    description: z.string().default(''),
    enabled: z.boolean()
  })
]);
export type MultipartFormBodySchema = z.infer<typeof multipartFormBodySchema>;

export const graphqlBodySchema = z.object({
  query: z.string(),
  variables: z.string()
});
export type GraphqlBodySchema = z.infer<typeof graphqlBodySchema>;

export const requestBodySchema = z.discriminatedUnion('mode', [
  z
    .object({
      mode: z.literal('none')
    })
    .passthrough(),
  z
    .object({
      mode: z.literal('json'),
      json: z.string().default('')
    })
    .passthrough(),
  z
    .object({
      mode: z.literal('text'),
      text: z.string().default('')
    })
    .passthrough(),
  z
    .object({
      mode: z.literal('xml'),
      xml: z.string().default('')
    })
    .passthrough(),
  z
    .object({
      mode: z.literal('formUrlEncoded'),
      formUrlEncoded: z.array(formUrlEncodedBodySchema).default([])
    })
    .passthrough(),
  z
    .object({
      mode: z.literal('multipartForm'),
      multipartForm: z.array(multipartFormBodySchema).default([])
    })
    .passthrough(),
  z
    .object({
      mode: z.literal('graphql'),
      graphql: graphqlBodySchema
    })
    .passthrough(),
  z
    .object({
      mode: z.literal('sparql'),
      sparql: z.string().default('')
    })
    .passthrough()
]);
export type RequestBodySchema = z.infer<typeof requestBodySchema>;
