import { z } from 'zod';

export const hotkeysSchema = z.object({
  save: z.string(),
  sendRequest: z.string(),
  editEnvironment: z.string(),
  newRequest: z.string(),
  closeTab: z.string(),
  openPreferences: z.string(),
  openCookies: z.string(),
  minimizeWindow: z.string(),
  switchToPreviousTab: z.string(),
  switchToNextTab: z.string(),
  closeAllTabs: z.string()
});
export type HotkeysSchema = z.infer<typeof hotkeysSchema>;

export const preferencesSchema = z.object({
  request: z
    .object({
      sslVerification: z.boolean().default(true),
      sslKeylogFile: z.string().default(''),
      customCaCertificate: z
        .object({
          enabled: z.boolean(),
          filePath: z.string().default('')
        })
        .default({ enabled: false, filePath: '' }),
      keepDefaultCaCertificates: z
        .object({
          enabled: z.boolean()
        })
        .default({ enabled: true }),
      storeCookies: z.boolean().default(true),
      sendCookies: z.boolean().default(true),
      timeout: z.number().min(0).max(3_600_000).default(30_000)
    })
    .default({} as any),
  display: z
    .object({
      hideTabs: z.boolean().default(false)
    })
    .default({} as any),
  font: z
    .object({
      codeFont: z
        .string()
        .optional()
        .transform((value) => (value === '' ? undefined : value)),
      codeFontSize: z.number().min(8).max(32).default(14)
    })
    .default({} as any),
  hotkeysOverwrite: hotkeysSchema.partial().default({}),
  proxy: z
    .object({
      mode: z.enum(['off', 'on', 'system']).default('system'),
      protocol: z.enum(['http', 'https', 'socks4', 'socks5']).default('socks5'),
      hostname: z.string().max(1024).default(''),
      port: z.number().min(1).max(65535).optional(),
      auth: z
        .object({
          enabled: z.boolean(),
          username: z.string().max(1024),
          password: z.string().max(1024)
        })
        .default({
          enabled: false,
          password: '',
          username: ''
        }),
      bypassProxy: z.string().max(1024).optional()
    })
    .default({} as any)
});
export type Preferences = z.infer<typeof preferencesSchema>;
