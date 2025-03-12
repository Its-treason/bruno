export function formatMilliseconds(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds} ms`;
  }

  // milliseconds greater than a second
  const seconds = Math.floor(milliseconds / 1000);
  const decimal = ((milliseconds % 1000) / 1000) * 100;
  return seconds + '.' + decimal.toFixed(0) + ' s';
}

export function formatDate(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds} ${year}-${month}-${day}`;
}
