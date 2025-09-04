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
    contentType: z.string().default(''),
    enabled: z.boolean()
  }),
  z.object({
    uid: z.string(),
    name: z.string(),
    type: z.literal('file'),
    value: z.array(z.string()),
    description: z.string().default(''),
    contentType: z.string().default(''),
    enabled: z.boolean()
  })
]);
export type MultipartFormBodySchema = z.infer<typeof multipartFormBodySchema>;

export const graphqlBodySchema = z.object({
  query: z.string().default(''),
  variables: z.string().default('')
});
export type GraphqlBodySchema = z.infer<typeof graphqlBodySchema>;

export const fileBodySchema = z.object({
  uid: z.string(),
  contentType: z.string(),
  filePath: z.string(),
  selected: z.boolean()
});
export type FileBodySchema = z.infer<typeof fileBodySchema>;

export const requestBodySchema = z.discriminatedUnion('mode', [
  z.looseObject({
    mode: z.literal('none')
  }),
  z.looseObject({
    mode: z.literal('json'),
    json: z.string().default('')
  }),
  z.looseObject({
    mode: z.literal('text'),
    text: z.string().default('')
  }),
  z.looseObject({
    mode: z.literal('xml'),
    xml: z.string().default('')
  }),
  z.looseObject({
    mode: z.literal('formUrlEncoded'),
    formUrlEncoded: z.array(formUrlEncodedBodySchema).default([])
  }),
  z.looseObject({
    mode: z.literal('multipartForm'),
    multipartForm: z.array(multipartFormBodySchema).default([])
  }),
  z.looseObject({
    mode: z.literal('graphql'),
    graphql: graphqlBodySchema
  }),
  z.looseObject({
    mode: z.literal('sparql'),
    sparql: z.string().default('')
  }),
  z.looseObject({
    mode: z.literal('file'),
    file: z.array(fileBodySchema).default([])
  })
]);
export type RequestBodySchema = z.infer<typeof requestBodySchema>;
