import katex from 'katex';
import 'katex/dist/katex.min.css';

export function renderMath(text: string): string {
  const codeBlocks = new Map<string, string>();
  let counter = 0;

  // Preserve code blocks
  text = text.replace(/```[\s\S]*?```|`[^`]+`/g, match => {
    const placeholder = `%%CODE_BLOCK_${counter}%%`;
    codeBlocks.set(placeholder, match);
    counter++;
    return placeholder;
  });

  // Display math ($$...$$)
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true });
    } catch (e) {
      console.error('KaTeX error:', e);
      return `$$${math}$$`;
    }
  });

  // Inline math ($...$)
  text = text.replace(/\$([^$\n]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false });
    } catch (e) {
      console.error('KaTeX error:', e);
      return `$${math}$`;
    }
  });

  // LaTeX-style math
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    try {
      return katex.renderToString(math, { displayMode: true });
    } catch (e) {
      console.error('KaTeX error:', e);
      return math;
    }
  });

  text = text.replace(/\\\((.*?)\\\)/g, (_, math) => {
    try {
      return katex.renderToString(math, { displayMode: false });
    } catch (e) {
      console.error('KaTeX error:', e);
      return math;
    }
  });

  // Restore code blocks
  codeBlocks.forEach((value, key) => {
    text = text.replace(key, value);
  });

  return text;
}