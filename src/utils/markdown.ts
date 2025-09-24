import { marked } from 'marked';
import Prism from 'prismjs';

// Import common languages for syntax highlighting
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';

// Configure marked
// marked's options type is strict; cast to any for a small set of extended options
marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  // typed highlight function
  highlight: function(code: string, lang?: string) {
    if (lang && Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    }
    return code;
  },
  pedantic: false,
} as any);

export function renderMarkdown(content: string): string {
  // marked.parse may return string or Promise<string> depending on async options.
  // This project uses synchronous highlighting, so parse returns a string; assert as string.
  return marked.parse(content) as string;
}

export function highlightCode(element: HTMLElement) {
  const codeBlocks = element.querySelectorAll('pre code');
  codeBlocks.forEach((block) => {
    const classList = Array.from(block.classList);
    // Prism expects classes like language-js, language-typescript, etc.
    const hasLanguage = classList.some((c) => c.startsWith('language-'));
    if (hasLanguage) {
      Prism.highlightElement(block as Element);
    }
  });
}