import katex from 'katex';

export function Equation({ tex, block = false }: { tex: string; block?: boolean }) {
  let markup: string;
  try {
    markup = katex.renderToString(tex, {
      output: 'htmlAndMathml',
      trust: false,
      throwOnError: true,
      displayMode: block,
    });
  } catch (error) {
    if (import.meta.env.DEV) throw error;
    console.error('Equation rendering failed', error);
    return <code>{tex}</code>;
  }
  const Tag = block ? 'div' : 'span';
  return <Tag className={block ? 'equation' : undefined} dangerouslySetInnerHTML={{ __html: markup }} />;
}
