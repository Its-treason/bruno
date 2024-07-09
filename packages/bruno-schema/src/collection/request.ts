import { z } from 'zod';
import { requestAuthSchema } from './requestAuth';
import { requestBodySchema } from './requestBody';

// TODO: Remove some defaults

export const headerSchema = z.object({
  uid: z.string(),
  name: z.string(),
  value: z.string(),
  description: z.string().default(''),
  enabled: z.boolean()
});
export type HeaderSchema = z.infer<typeof headerSchema>;

export const paramSchema = z.object({
  uid: z.string(),
  name: z.string(),
  value: z.string(),
  description: z.string().default(''),
  type: z.enum(['query', 'path']),
  enabled: z.boolean()
});
export type ParamSchema = z.infer<typeof paramSchema>;

export const requestVarSchema = z.object({
  uid: z.string(),
  name: z.string(),
  value: z.string(),
  description: z.string().default(''),
  enabled: z.boolean()
});
export type RequestVarSchema = z.infer<typeof requestVarSchema>;

export const assertionSchema = z.object({
  uid: z.string(),
  name: z.string(),
  value: z.string(),
  description: z.string().default(''),
  enabled: z.boolean()
});
export type AssertionSchema = z.infer<typeof assertionSchema>;

export const httpRequestSchema = z.object({
  url: z.string(),
  method: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z]+$/)
    .transform((base) => base.toUpperCase()),
  headers: z.array(headerSchema),
  params: z.array(paramSchema),
  body: requestBodySchema,
  auth: requestAuthSchema,

  script: z
    .object({
      req: z.string().default(''),
      res: z.string().default('')
    })
    .default({}),
  vars: z.object({
    req: z.array(requestVarSchema).default([]),
    res: z.array(requestVarSchema).default([])
  }),
  assertions: z.array(assertionSchema),
  tests: z.string(),
  docs: z.string().default('')
});
export type HttpRequestSchema = z.infer<typeof httpRequestSchema>;

export const collectionRequestSchema = z.object({
  headers: z.array(headerSchema).default([]),
  auth: requestAuthSchema,

  script: z
    .object({
      req: z.string().default(''),
      res: z.string().default('')
    })
    .default({}),
  tests: z.string().default(''),
  docs: z.string().default('')
});
export type CollectionRequestSchema = z.infer<typeof collectionRequestSchema>;

const baseRequestItemSchema = z.object({
  uid: z.string(),
  type: z.enum(['http-request', 'graphql-request', 'folder', 'js']),
  seq: z.coerce.number().min(1).optional(),
  name: z.string().min(1),
  request: httpRequestSchema.optional(),
  fileContent: z.string().optional(),
  filename: z.string().optional(),
  pathname: z.string().optional(),
  collapsed: z.boolean().optional(),
  root: z
    .object({
      request: collectionRequestSchema
    })
    .optional(),
  requestState: z.enum(['queued', 'sending', 'received']).optional()
});
export type RequestItemSchema = z.infer<typeof baseRequestItemSchema> & {
  items?: RequestItemSchema[];
  draft?: RequestItemSchema;
};
export const requestItemSchema = baseRequestItemSchema.extend({
  items: z.lazy(() => requestItemSchema.array()).optional(),
  draft: z.lazy(() => requestItemSchema).optional()
}) as z.ZodType<RequestItemSchema>;
