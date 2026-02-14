/**
 * Utilities for converting JS/TS test expressions to Python syntax.
 */

/** Convert camelCase to snake_case */
export function camelToSnake(name: string): string {
  return name.replace(/[A-Z]/g, (ch) => '_' + ch.toLowerCase());
}

/** Extract function name from TS/JS starter code (first function declaration) */
export function extractJsFuncName(starterCode: string): string | null {
  const match = starterCode.match(/function\s+([a-zA-Z_$][\w$]*)\s*\(/);
  return match ? match[1] : null;
}

/** Extract function name from Python starter code (first def statement) */
export function extractPythonFuncName(pythonStarter: string): string | null {
  const match = pythonStarter.match(/def\s+([a-zA-Z_][\w]*)\s*\(/);
  return match ? match[1] : null;
}

/**
 * Convert a JS test input expression to Python syntax.
 * Replaces function name (camelCase → snake_case) and JS literals → Python literals.
 */
export function toPythonTestInput(
  jsInput: string,
  jsFuncName: string,
  pyFuncName: string,
): string {
  return jsInput
    .replace(new RegExp('\\b' + escapeRegExp(jsFuncName) + '\\b', 'g'), pyFuncName)
    .replace(/\bnull\b/g, 'None')
    .replace(/\btrue\b/g, 'True')
    .replace(/\bfalse\b/g, 'False')
    .replace(/\bundefined\b/g, 'None');
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
