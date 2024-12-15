import z from 'zod';

export const fileNameSchema = z
  .string()
  .trim()
  .min(1, { message: 'Filename must not be empty' })
  .max(255, { message: 'Filename must be 255 characters or less' })
  .regex(/^[^<>:"/\\|?*\u0000-\u001F]+$/, {
    message: 'Invalid filename. Avoid special characters and reserved names, including all from Windows.'
  })
  .refine(
    (name) => {
      const reservedNames = [
        'CON',
        'PRN',
        'AUX',
        'NUL',
        'COM1',
        'COM2',
        'COM3',
        'COM4',
        'COM5',
        'COM6',
        'COM7',
        'COM8',
        'COM9',
        'LPT1',
        'LPT2',
        'LPT3',
        'LPT4',
        'LPT5',
        'LPT6',
        'LPT7',
        'LPT8',
        'LPT9'
      ];

      return !reservedNames.includes(name.toUpperCase());
    },
    {
      message: 'Filename cannot be a reserved Windows name'
    }
  )
  .refine(
    (name) => {
      return !name.startsWith(' ') && !name.endsWith(' ') && !name.startsWith('.') && !name.endsWith('.');
    },
    {
      message: 'Filename cannot start or end with a space or period'
    }
  );
