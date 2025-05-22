
export function TextFormator(text: string): string {
  return (text ?? '')
  .replace(/_/g, ' ')
  .toLocaleLowerCase()
  .replace(/\b\w/g, char => char.toUpperCase());
}