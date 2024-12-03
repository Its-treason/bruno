/*
 * This file is part of bruno-electron.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { format } from 'prettier';

export async function prettierFormat(text: string, parser: string): Promise<string> {
  return format(text, { parser });
}
