import Handlebars from 'handlebars';

/**
 * @description
 * converts Handlebar AST back to plain template string
 * @param node
 */

export function convertAstToString(node: hbs.AST.Node | null): string {
  const fn = convertAstToString;
  if (!node) return '';

  let output = '';

  switch (node.type) {
    case 'Program':
      output = (node as hbs.AST.Program).body
        .map((n) => {
          if (n.type === 'CommentStatement') {
            // @ts-ignore
            return `{{!--${n.value}--}}`;
          }
          return fn(n);
        })
        .join('');
      break;

    case 'BlockStatement':
      const blockNode = node as hbs.AST.BlockStatement;
      const blockPath = blockNode.path.original;
      const blockProgram = fn(blockNode.program);
      const blockParams = blockNode.params
        .map(fn)
        .join(' ');

      const blockParamsString = (
        node as hbs.AST.BlockStatement
      ).program?.blockParams
        ?.map((param) => param)
        .join(' ');

      let inverseProgram = '';
      let nextInverse: hbs.AST.Program | null = blockNode.inverse;

      while (nextInverse) {
        if (nextInverse.body[0]?.type === 'BlockStatement') {
          const nextBlock = nextInverse.body[0] as hbs.AST.BlockStatement;
          const nextBlockPath = nextBlock.path.original;

          inverseProgram += `{{else ${nextBlockPath} ${nextBlock.params.map(fn).join(' ')}}}${fn(nextBlock.program)}`;
          nextInverse = nextBlock.inverse;
        } else {
          inverseProgram += `{{else}}${fn(nextInverse)}`;
          nextInverse = null;
        }
      }


      output = `{{#${blockPath}${
        blockParams ? ' ' + blockParams : ''
      }${
        blockParamsString ? ' as |' + blockParamsString + '|' : ''
      }}}${blockProgram}${inverseProgram}{{/${
        blockPath
      }}}`;

      break;

    case 'MustacheStatement':
      const mustacheNode = node as hbs.AST.MustacheStatement;
      const openingBraces = mustacheNode.escaped ? '{{' : '{{{';
      const closingBraces = mustacheNode.escaped ? '}}' : '}}}';
      const mustacheParams = mustacheNode.params.map(fn).join(' ');

      // @ts-ignore
      let originalPath = mustacheNode.path.original;
      const excludeRegex = new RegExp(
        '@(root|first|index|key|last|level)|\\.{1,2}\\/|\\.|_',
        'g'
      );
      // reserved keyword of handlebar
      if (/[\W_]/.test(originalPath) && !excludeRegex.test(originalPath)) {
        // Contains special characters
        originalPath = `[${originalPath}]`;
      }
      output = `${openingBraces}${originalPath}${
        mustacheParams ? ' ' + mustacheParams : ''
      }${closingBraces}`;
      break;

    case 'ContentStatement':
      // @ts-ignore
      output = (node as hbs.AST.ContentStatement).original;
      break;

    case 'PathExpression':
      output = (node as hbs.AST.PathExpression).original;
      break;

    case 'SubExpression':
      const subExpNode = node as hbs.AST.SubExpression;
      const subParams = subExpNode.params
        .map(fn)
        .join(' ');
      const hashPairs = (subExpNode.hash?.pairs ?? [])
        .map((hashPair: any) => {
          return `${hashPair.key}='${hashPair.value.value}'`;
        })
        .join(' ');

      const allArgs = [subParams, hashPairs].filter(Boolean).join(' ');

      output = `(${subExpNode.path.original}${
        allArgs ? ' ' + allArgs : ''
      })`;
      break;

    case 'PartialStatement':
    case 'PartialBlockStatement':
      const partialNode = node as
        | hbs.AST.PartialStatement
        | hbs.AST.PartialBlockStatement;
      if ('name' in partialNode && partialNode.name.type === 'SubExpression') {
        output = `{{> (${fn(partialNode.name.path)}`;
        const params = partialNode.name.params.map(fn);
        if (params.length > 0) {
          output += ' ' + params.join(' ');
        }
        output += ')';
      } else if ('name' in partialNode) {
        // @ts-ignore
        output = `{{> ${partialNode.name.original}`;
      }

      // Continue handling params and hash as before
      if (partialNode.params && partialNode.params.length > 0) {
        const params = partialNode.params.map(fn).join(' ');
        output += ` ${params}`;
      }
      if (partialNode.hash && partialNode.hash.pairs.length > 0) {
        const hash = partialNode.hash.pairs
          .map((p) => `${p.key}=${fn(p.value)}`)
          .join(' ');
        output += ` ${hash}`;
      }
      output += ' }}';
      break;

    case 'StringLiteral':
      // @ts-ignore
      output = `'${node.value}'`;
      break;

    case 'NumberLiteral':
      // @ts-ignore
      output = `${node.value}`;
      break;

    case 'BooleanLiteral':
      // @ts-ignore
      output = `${node.value}`;
      break;
    default:
      output = '';
      break;
  }

  return output;
}
