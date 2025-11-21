/**
 * JSON Parser Utilities
 * Handles parsing and sanitization of GPT responses
 */

/**
 * Attempts to parse JSON from GPT response with various fallback strategies
 */
export function tryParseQuestionJson(raw: string): any | null {
  try {
    return JSON.parse(raw);
  } catch { }

  try {
    const noFences = stripCodeFences(raw);
    const candidate = extractFirstJsonObject(noFences);
    if (!candidate) return null;

    const fixedBackslashes = fixInvalidBackslashes(candidate);

    const sanitized = fixedBackslashes.replace(/\u0000/g, "");

    return JSON.parse(sanitized);
  } catch (e) {
    console.error("tryParseQuestionJson failed after sanitation:", e);
    return null;
  }
}

/**
 * Removes markdown code fences from text
 */
function stripCodeFences(text: string): string {
  return text.replace(/```[a-zA-Z]*\n([\s\S]*?)```/g, "$1").trim();
}

/**
 * Extracts the first JSON object from text
 */
function extractFirstJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

/**
 * Fixes invalid backslash escapes in JSON-like strings
 */
function fixInvalidBackslashes(jsonLike: string): string {
  return jsonLike.replace(/\\(?!["\\\/bfnrtu])/g, "\\\\");
}

