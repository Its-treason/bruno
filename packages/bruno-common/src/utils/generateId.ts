const ID_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ID_LENGTH = 5; // Almost 1 Billion possible combinations

export function generateId(): string {
  let result = '';
  for (let i = 0; i < ID_LENGTH; i++) {
    result += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)];
  }
  return result;
}
