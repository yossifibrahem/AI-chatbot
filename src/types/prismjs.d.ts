declare module 'prismjs' {
	export const languages: Record<string, any>;
	export function highlight(code: string, grammar: any, language?: string): string;
	export function highlightElement(element: Element): void;

	const Prism: {
		languages: Record<string, any>;
		highlight(code: string, grammar: any, language?: string): string;
		highlightElement(element: Element): void;
	};

	export default Prism;
}
