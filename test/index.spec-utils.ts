/**
 * Preprocesses the content by replacing double opening parentheses "(("
 * with a modified format "(X (" so that Handlebar can parse it
 */
export function preprocess(content: string): string {
  while (content.includes('((')) {
    content = content.replace(/\(\(/g, '(X (');
  }
  return content;
}

/**
 * Postprocesses the content by reverting the modified format "(X (" back to
 * double opening parentheses "((" after further processing.
 */
export function postprocess(content: string): string {
  while (content.includes('(X (')) {
    content = content.replace(/\(X \(/g, '((');
  }
  return content;
}
