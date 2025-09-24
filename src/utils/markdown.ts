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

// Enhance code blocks rendered inside a container produced by `renderMarkdown`.
// This will add a header with the language label and a copy button to each
// <pre><code class="language-..."> block. Call this after inserting HTML into the DOM.
export function enhanceCodeBlocks(container: HTMLElement) {
  const codePreElements = Array.from(container.querySelectorAll('pre')) as HTMLElement[];
  codePreElements.forEach((pre) => {
    // Skip if already enhanced
    if (pre.closest('.code-block-wrapper')) return;

    const code = pre.querySelector('code');
    if (!code) return;

    const languageClass = Array.from(code.classList).find((c) => c.startsWith('language-')) || 'language-text';
    const language = languageClass.replace(/^language-/, '') || 'text';
    const codeText = code.textContent || '';

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper my-4 rounded-lg overflow-hidden border border-gray-700 bg-gray-900';

    const header = document.createElement('div');
    header.className = 'code-block-header flex items-center justify-between px-3 py-1 text-xs text-gray-300 bg-gray-800 border-b border-gray-700';
    header.innerHTML = `<span class="font-mono lowercase">${language}</span>`;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'flex items-center gap-2 text-gray-300 hover:text-white focus:outline-none';
    btn.setAttribute('aria-label', 'Copy code');
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><rect x="1" y="1" width="13" height="13" rx="2" ry="2"></rect></svg><span class="hidden sm:inline">Copy</span>`;

    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeText);
        const label = btn.querySelector('span');
        if (label) {
          const prev = label.textContent;
          label.textContent = 'Copied';
          setTimeout(() => (label.textContent = prev || 'Copy'), 1800);
        }
      } catch (e) {
        // ignore
      }
    });

    header.appendChild(btn);

    // Move the existing <pre> into a new container area
    pre.classList.add('m-0', 'p-4', 'overflow-auto', 'max-h-64');
    wrapper.appendChild(header);
    wrapper.appendChild(pre.cloneNode(true));

    // Replace original pre with wrapper
    pre.replaceWith(wrapper);
  });

  // After wrapping, highlight all code
  highlightCode(container);
}