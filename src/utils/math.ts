import katex from 'katex';
import 'katex/dist/katex.min.css';

export type MathMap = Record<string, string>;

const FENCED_OR_INLINE_CODE_RE = /```[\s\S]*?```|`[^`]+`/g;
const DISPLAY_DOLLAR_RE = /\$\$([\s\S]+?)\$\$/g;
const DISPLAY_BRACKET_RE = /\\\[([\s\S]*?)\\\]/g;
const INLINE_DOLLAR_RE = /\$([^$\n]+?)\$/g;
const INLINE_PARENS_RE = /\\\((.*?)\\\)/g;

function makePlaceholder(prefix: string, id: string, n: number) {
  // include a timestamp component to reduce chance of collisions with user text
  return `%%${prefix}_${id}_${n}%%`;
}

/**
 * Extract math expressions and replace them with placeholders.
 * Returns the text with placeholders and a map from placeholder -> KaTeX HTML.
 */
export function extractMathPlaceholders(text: string): { text: string; mathMap: MathMap } {
  const codeBlocks = new Map<string, string>();
  let counter = 0;
  const id = Date.now().toString(36);

  // Protect fenced code blocks and inline code
  text = text.replace(FENCED_OR_INLINE_CODE_RE, match => {
    const placeholder = makePlaceholder('CODE_BLOCK', id, counter);
    codeBlocks.set(placeholder, match);
    counter++;
    return placeholder;
  });

  const mathMap: MathMap = {};
  let mathCounter = 0;

  const replaceWithKatex = (math: string, displayMode: boolean) => {
    const key = makePlaceholder('MATH_BLOCK', id, mathCounter);
    mathCounter++;
    try {
      mathMap[key] = katex.renderToString(math.trim(), { displayMode });
    } catch (e) {
      // Keep original delimiters as a readable fallback
      // eslint-disable-next-line no-console
      console.error('KaTeX render error:', e);
      mathMap[key] = displayMode ? `$$${math}$$` : `$${math}$`;
    }
    return key;
  };

  // Replace display and inline math with placeholders
  text = text.replace(DISPLAY_DOLLAR_RE, (_, math) => replaceWithKatex(math, true));
  text = text.replace(DISPLAY_BRACKET_RE, (_, math) => replaceWithKatex(math, true));
  text = text.replace(INLINE_DOLLAR_RE, (_, math) => replaceWithKatex(math, false));
  text = text.replace(INLINE_PARENS_RE, (_, math) => replaceWithKatex(math, false));

  // Restore code blocks (use split/join to replace all occurrences)
  for (const [placeholder, original] of codeBlocks.entries()) {
    text = text.split(placeholder).join(original);
  }

  return { text, mathMap };
}

/**
 * Inject KaTeX HTML back into rendered HTML by replacing placeholders.
 */
export function injectMathPlaceholders(html: string, mathMap: MathMap): string {
  if (!mathMap || Object.keys(mathMap).length === 0) return html;
  let out = html;
  for (const key of Object.keys(mathMap)) {
    out = out.split(key).join(mathMap[key]);
  }
  return out;
}