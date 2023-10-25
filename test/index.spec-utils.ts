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
 * Swap double quotes (") with single quotes (') within {{}} or {{{{}}}} only.
 * @param content - The input string where quotes need to be swapped.
 * @return The modified string with quotes swapped within {{}} or {{{{}}}}.
 */
export function swapQuotes(content: string): string {
  return content.replace(/{{([^{}]+)}}|{{{{([^{}]+)}}}}/g, (match) => {
    return match.replace(/"/g, "'");
  });
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

/**
 * Formats a number with the appropriate ordinal suffix.
 *
 * @param num - The number to format.
 * @returns The formatted number as a string.
 */
export function formatNumberSuffix(num: number): string {
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${num}th`;
  }

  switch (lastDigit) {
    case 1:
      return `${num}st`;
    case 2:
      return `${num}nd`;
    case 3:
      return `${num}rd`;
    default:
      return `${num}th`;
  }
}
