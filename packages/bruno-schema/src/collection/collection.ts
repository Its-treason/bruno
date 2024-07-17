import { z } from 'zod';
import { collectionRequestSchema, httpRequestSchema, requestItemSchema } from './request';
import { environmentSchema } from './environment';

// This has a lot of defaults because the Config may be older and Bruno set any defaults
export const brunoConfigSchema = z
  .object({
    version: z.literal('1'),
    name: z.string(),
    type: z.literal('collection'),
    ignore: z.array(z.string()).default([]),
    scripts: z
      .object({
        moduleWhitelist: z.array(z.string()).default([])
      })
      .default({ moduleWhitelist: [] }),
    proxy: z
      .object({
        enabled: z.boolean().default(false),
        protocol: z.enum(['http', 'https', 'socks4', 'socks5']),
        hostname: z.string(),
        port: z.number().or(z.string()),
        auth: z.object({
          enabled: z.boolean(),
          username: z.string(),
          password: z.string()
        }),
        bypassProxy: z.string().default('')
      })
      .default({
        enabled: false,
        protocol: 'http',
        hostname: '',
        port: 0,
        auth: { enabled: false, username: '', password: '' },
        bypassProxy: ''
      }),
    clientCertificates: z
      .object({
        enabled: z.boolean(),
        certs: z.array(z.unknown())
      })
      .default({ enabled: false, certs: [] }),
    presets: z
      .object({
        requestType: z.enum(['graphql', 'http']).default('http'),
        requestUrl: z.string().default('')
      })
      .default({ requestType: 'http', requestUrl: '' })
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
  runtimeVariables: z.record(z.unknown()),
  processEnvVariables: z.record(z.unknown()).optional(),
  root: z
    .object({
      request: collectionRequestSchema.optional()
    })
    .default({}),
  brunoConfig: brunoConfigSchema,
  collapsed: z.boolean().default(true)
});
export type CollectionSchema = z.infer<typeof collectionSchema>;
