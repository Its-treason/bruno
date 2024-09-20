import { z } from 'zod';

export const awsV4AuthSchema = z.object({
  accessKeyId: z.string(),
  secretAccessKey: z.string(),
  sessionToken: z.string(),
  service: z.string(),
  region: z.string(),
  profileName: z.string()
});
export type AwsV4AuthSchema = z.infer<typeof awsV4AuthSchema>;

export const basicAuthSchema = z.object({
  username: z.string(),
  password: z.string()
});
export type BasicAuthSchema = z.infer<typeof basicAuthSchema>;

export const bearerAuthSchema = z.object({
  token: z.string()
});
export type BearerAuthSchema = z.infer<typeof bearerAuthSchema>;

export const digestAuthSchema = z.object({
  username: z.string(),
  password: z.string()
});
export type DigestAuthSchema = z.infer<typeof digestAuthSchema>;

export const oauth2AuthSchema = z.discriminatedUnion('grantType', [
  z.object({
    grantType: z.literal('password'),
    username: z.string(),
    password: z.string(),
    accessTokenUrl: z.string(),
    clientId: z.string(),
    clientSecret: z.string(),
    scope: z.string()
  }),
  z.object({
    grantType: z.literal('client_credentials'),
    username: z.string(),
    password: z.string(),
    accessTokenUrl: z.string(),
    clientId: z.string(),
    clientSecret: z.string(),
    scope: z.string()
  }),
  z.object({
    grantType: z.literal('authorization_code'),
    callbackUrl: z.string(),
    authorizationUrl: z.string(),
    accessTokenUrl: z.string(),
    clientId: z.string(),
    clientSecret: z.string(),
    scope: z.string(),
    state: z.string(),
    pkce: z.boolean()
  })
]);

export const apiKeyAuthSchema = z.object({
  key: z.string(),
  value: z.string(),
  placement: z.enum(['header', 'queryparams'])
});
export type ApiKeyAuthSchema = z.infer<typeof apiKeyAuthSchema>;

export const requestAuthSchema = z
  .discriminatedUnion('mode', [
    z.object({
      mode: z.literal('inherit')
    }),
    z.object({
      mode: z.literal('none')
    }),
    z.object({
      mode: z.literal('awsv4'),
      awsv4: awsV4AuthSchema
    }),
    z.object({
      mode: z.literal('basic'),
      basic: basicAuthSchema
    }),
    z.object({
      mode: z.literal('bearer'),
      bearer: bearerAuthSchema
    }),
    z.object({
      mode: z.literal('digest'),
      digest: digestAuthSchema
    }),
    z.object({
      mode: z.literal('oauth2'),
      oauth2: oauth2AuthSchema
    }),
    z.object({
      mode: z.literal('apikey'),
      apikey: apiKeyAuthSchema
    })
  ])
  .default({ mode: 'inherit' });
export type RequestAuthSchema = z.infer<typeof requestAuthSchema>;
