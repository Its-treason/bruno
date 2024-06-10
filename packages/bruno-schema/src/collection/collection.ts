import { z } from 'zod';
import { requestItemSchema } from './request';
import { environmentSchema } from './environment';

export const brunoConfigSchema = z
  .object({
    version: z.literal('1'),
    name: z.string(),
    type: z.literal('collection'),
    ignore: z.array(z.string()).default([]),
    scripts: z.object({
      moduleWhitelist: z.array(z.string())
    }),
    proxy: z.object({
      enabled: z.boolean().default(false),
      protocol: z.enum(['http', 'https', 'socks4', 'socks5']),
      hostname: z.string(),
      port: z.number(),
      auth: z.object({
        enabled: z.boolean(),
        username: z.string(),
        password: z.string()
      }),
      bypassProxy: z.string()
    }),
    clientCertificates: z.object({
      enabled: z.boolean(),
      certs: z.array(z.unknown())
    }),
    presets: z.object({
      requestType: z.enum(['graphql', 'http']).default('http'),
      requestUrl: z.string().default('')
    })
  })
  .passthrough();
export type BrunoConfigSchema = z.infer<typeof brunoConfigSchema>;

export const collectionSchema = z.object({
  version: z.literal('1'),
  uid: z.string(),
  name: z.string().min(1),
  items: z.array(requestItemSchema),
  activeEnvironmentUid: z.string().uuid().nullable(),
  environments: z.array(environmentSchema),
  pathname: z.string(),
  collectionVariables: z.record(z.unknown()),
  brunoConfig: brunoConfigSchema
});
export type CollectionSchema = z.infer<typeof collectionSchema>;
