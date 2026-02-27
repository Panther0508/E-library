declare module 'react-syntax-highlighter' {
  import { ComponentType } from 'react';
  const SyntaxHighlighter: ComponentType<any>;
  export { SyntaxHighlighter };
  export default SyntaxHighlighter;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  const styles: Record<string, any>;
  export default styles;
}
