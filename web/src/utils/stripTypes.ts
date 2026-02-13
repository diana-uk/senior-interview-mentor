// Split function params respecting angle bracket nesting (for generics like Map<K,V>)
function splitParams(params: string): string[] {
  const result: string[] = [];
  let current = '';
  let depth = 0;
  for (const ch of params) {
    if (ch === '<') depth++;
    if (ch === '>') depth--;
    if (ch === ',' && depth === 0) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current) result.push(current);
  return result;
}

// Strip TypeScript type annotations to produce valid JavaScript
export function stripTypeAnnotations(code: string): string {
  let result = code;

  // Remove type/interface declaration lines
  result = result.replace(/^\s*(?:export\s+)?(?:type|interface)\s+.*$/gm, '');

  // Strip return types: ): Type { → ) {
  result = result.replace(/(\))\s*:\s*[\w\[\]<>,.|&\s]+?(?=\s*\{)/g, '$1');

  // Strip return types for arrow functions: ): Type => → ) =>
  result = result.replace(/(\))\s*:\s*[\w\[\]<>,.|&\s]+?(?=\s*=>)/g, '$1');

  // Strip parameter type annotations inside parentheses
  result = result.replace(/\(([^)]*)\)/g, (_match, inner: string) => {
    const params = splitParams(inner);
    const stripped = params.map(p => {
      const trimmed = p.trim();
      if (!trimmed) return p;
      // Match: name: Type  or  name?: Type  or  name: Type = default
      const m = trimmed.match(/^(\w+)(?:\?\s*)?:\s*(.+?)(\s*=\s*.*)?$/);
      if (m) {
        const name = m[1];
        const defaultVal = m[3] ? ' ' + m[3].trim() : '';
        return name + defaultVal;
      }
      return trimmed;
    }).join(', ');
    return `(${stripped})`;
  });

  // Strip variable type annotations: const x: Type = → const x =
  result = result.replace(/((?:const|let|var)\s+\w+)\s*:\s*[^=;\n]+(?=\s*=)/g, '$1');

  // Remove angle brackets on generic constructors/calls: new Map<K,V>() → new Map()
  result = result.replace(/(new\s+\w+)<[^>]+>/g, '$1');
  result = result.replace(/\b(Map|Set|Array|WeakMap|WeakSet|Promise)<[^>]+>/g, '$1');

  // Remove non-null assertions: expr! → expr (before . , ) ] ; or end of line)
  result = result.replace(/!(?=[.),;\]\s])/g, '');

  // Remove 'as Type' casts
  result = result.replace(/\bas\s+\w+(?:<[^>]*>)?(?:\[\])*/g, '');

  // Clean up multiple blank lines
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}
