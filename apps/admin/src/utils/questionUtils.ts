export const replaceLatexDelimiters = (text: string): string => {
  let updated = text;
  updated = updated.replace(/\\nabla/g, "∇");
  updated = updated.replace(/\bext\{/g, "\\text{");
  updated = updated.replace(/\\\[/g, '$$');
  updated = updated.replace(/\\\]/g, '$$');
  updated = updated.replace(/\\\(/g, '$');
  updated = updated.replace(/\\\)/g, '$');
  updated = updated.replace(/;/g, '');
  updated = updated.replace(/\\frac/g, '\\dfrac');
  return updated;
};

export const replaceQuestionContent = (content: string): string => {
  let updated = content;
  updated = updated.replace(/\$\$([^$\n]+)\$\$/g, (_, expr) => `$${expr}$`).replace(/<b[^>]*>(.*?)<\/b>/gi, '$1');
  return updated;
};