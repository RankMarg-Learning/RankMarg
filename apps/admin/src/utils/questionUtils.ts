export const replaceLatexDelimiters = (text: string): string => {
  let updated = text;
  updated = updated.replace(/\\\[/g, '$$');
  updated = updated.replace(/\\\]/g, '$$');
  updated = updated.replace(/\\\(/g, '$');
  updated = updated.replace(/\\\)/g, '$');
  return updated;
};
