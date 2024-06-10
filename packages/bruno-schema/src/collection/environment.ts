import { z } from 'zod';

export const environmentVariableSchema = z.object({
  uid: z.string(),
  name: z.string(),
  value: z.string(),
  type: z.enum(['text']),
  enabled: z.boolean(),
  secret: z.boolean()
});
export type EnvironmentVariableSchema = z.infer<typeof environmentVariableSchema>;

export const environmentSchema = z.object({
  uid: z.string(),
  name: z.string(),
  variables: z.array(environmentVariableSchema)
});
export type EnvironmentSchema = z.infer<typeof environmentSchema>;
