import { generateId } from '@usebruno/common';
import { z } from 'zod';

export const environmentVariableSchema = z.object({
  id: z.string().default(generateId),
  name: z.string(),
  value: z.string(),
  type: z.enum(['text']).default('text'),
  enabled: z.boolean(),
  secret: z.boolean()
});
export type EnvironmentVariableSchema = z.infer<typeof environmentVariableSchema>;

export const environmentSchema = z.object({
  id: z.string().default(generateId),
  name: z.string(),
  contentHash: z.string(),
  variables: z.array(environmentVariableSchema)
});
export type EnvironmentSchema = z.infer<typeof environmentSchema>;
