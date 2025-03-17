import { z } from 'zod';

export const awsV4AuthSchema = z.object({
  accessKeyId: z.string().default(''),
  secretAccessKey: z.string().default(''),
  sessionToken: z.string().default(''),
  service: z.string().default(''),
  region: z.string().default(''),
  profileName: z.string().default('')
});
export type AwsV4AuthSchema = z.infer<typeof awsV4AuthSchema>;

export const basicAuthSchema = z.object({
  username: z.string().default(''),
  password: z.string().default('')
});
export type BasicAuthSchema = z.infer<typeof basicAuthSchema>;

export const bearerAuthSchema = z.object({
  token: z.string().default('')
});
export type BearerAuthSchema = z.infer<typeof bearerAuthSchema>;

export const digestAuthSchema = z.object({
  username: z.string().default(''),
  password: z.string().default('')
});
export type DigestAuthSchema = z.infer<typeof digestAuthSchema>;

export const passwordGrantSchema = z.object({
  grantType: z.literal('password'),
  username: z.string().default(''),
  password: z.string().default(''),
  accessTokenUrl: z.string().default(''),
  clientId: z.string().default(''),
  clientSecret: z.string().default(''),
  scope: z.string().default('')
});
export type PasswordGrantSchema = z.infer<typeof passwordGrantSchema>;

export const clientCredentialsGrantSchema = z.object({
  grantType: z.literal('client_credentials'),
  username: z.string().default(''),
  password: z.string().default(''),
  accessTokenUrl: z.string().default(''),
  clientId: z.string().default(''),
  clientSecret: z.string().default(''),
  scope: z.string().default('')
});
export type ClientCredentialsGrantSchema = z.infer<typeof clientCredentialsGrantSchema>;

export const authorizationCodeGrantSchema = z.object({
  grantType: z.literal('authorization_code'),
  callbackUrl: z.string().default(''),
  authorizationUrl: z.string().default(''),
  accessTokenUrl: z.string().default(''),
  clientId: z.string().default(''),
  clientSecret: z.string().default(''),
  scope: z.string().default(''),
  state: z.string().default(''),
  pkce: z.boolean().default(false)
});
export type AuthorizationCodeGrantSchema = z.infer<typeof authorizationCodeGrantSchema>;

export const oauth2AuthSchema = z.discriminatedUnion('grantType', [
  passwordGrantSchema,
  clientCredentialsGrantSchema,
  authorizationCodeGrantSchema
]);
export type OAuth2AuthSchema = z.infer<typeof oauth2AuthSchema>;

export const apiKeyAuthSchema = z.object({
  key: z.string().default(''),
  value: z.string().default(''),
  placement: z.enum(['header', 'queryparams']).default('header')
});
export type ApiKeyAuthSchema = z.infer<typeof apiKeyAuthSchema>;

export const wsseAuthSchema = z.object({
  username: z.string().default(''),
  password: z.string().default('')
});
export type WsseAuthSchema = z.infer<typeof wsseAuthSchema>;

export const ntlmAuthSchema = z.object({
  username: z.string().default(''),
  password: z.string().default(''),
  domain: z.string().default('')
});
export type NtlmAuthSchema = z.infer<typeof ntlmAuthSchema>;

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
      awsv4: awsV4AuthSchema.default({})
    }),
    z.object({
      mode: z.literal('basic'),
      basic: basicAuthSchema.default({})
    }),
    z.object({
      mode: z.literal('bearer'),
      bearer: bearerAuthSchema.default({})
    }),
    z.object({
      mode: z.literal('digest'),
      digest: digestAuthSchema.default({})
    }),
    z.object({
      mode: z.literal('oauth2'),
      oauth2: oauth2AuthSchema.default({ grantType: 'authorization_code' })
    }),
    z.object({
      mode: z.literal('apikey'),
      apikey: apiKeyAuthSchema.default({})
    }),
    z.object({
      mode: z.literal('wsse'),
      wsse: wsseAuthSchema.default({})
    }),
    z.object({
      mode: z.literal('ntlm'),
      ntlm: ntlmAuthSchema.default({})
    })
  ])
  .default({ mode: 'inherit' });
export type RequestAuthSchema = z.infer<typeof requestAuthSchema>;
