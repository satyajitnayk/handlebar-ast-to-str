import Handlebars from 'handlebars';
import {HbsNodeTypes} from "./constants";
import {ModificationOptions} from "./interfaces";

/**
 * @description
 * converts Handlebar AST back to plain template string
 * @param node
 * @param options
 */
export function convertAstToString(
  node: hbs.AST.Node | null,
  options?: ModificationOptions
): string {
  const fn = convertAstToString;
  if (!node) return '';

  let output = '';

  switch (node.type) {
    case HbsNodeTypes.Program:
      output = (node as hbs.AST.Program).body
        .map((n) => {
          if (n.type === HbsNodeTypes.CommentStatement) {
            // @ts-ignore
            return `{{!--${n.value}--}}`;
          }
          return fn(n, options);
        })
        .join('');
      break;

    case HbsNodeTypes.BlockStatement:
      const blockNode = node as hbs.AST.BlockStatement;
      const blockPath = blockNode.path.original;
      const blockProgram = fn(blockNode.program, options);
      const blockParams = blockNode.params
        .map(d => {
          if (d.type === HbsNodeTypes.UndefinedLiteral) {
            return 'undefined';
          } else if (d.type === HbsNodeTypes.NullLiteral) {
            return 'null';
          }
          return fn(d, options);
        })
        // .map(d => d ? fn(d, options) : 'undefined')
        .join(' ');

      const blockParamsString = (
        node as hbs.AST.BlockStatement
      ).program?.blockParams
        ?.map((param) => param)
        .join(' ');

      let inverseProgram = '';
      let nextInverse: hbs.AST.Program | null = blockNode.inverse;

      while (nextInverse) {
        if (nextInverse.body[0]?.type === HbsNodeTypes.BlockStatement) {
          const nextBlock = nextInverse.body[0] as hbs.AST.BlockStatement;
          const nextBlockPath = nextBlock.path.original;

          inverseProgram += `{{else ${nextBlockPath} ${nextBlock.params.map(d => fn(d, options)).join(' ')}}}${fn(nextBlock.program, options)}`;
          nextInverse = nextBlock.inverse;
        } else {
          inverseProgram += `{{else}}${fn(nextInverse, options)}`;
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

    case HbsNodeTypes.MustacheStatement:
      const mustacheNode = node as hbs.AST.MustacheStatement;
      const openingBraces = mustacheNode.escaped ? '{{' : '{{{';
      const closingBraces = mustacheNode.escaped ? '}}' : '}}}';
      const mustacheParams = mustacheNode.params.map(d => {
        if (d.type === HbsNodeTypes.UndefinedLiteral) {
          return 'undefined';
        } else if (d.type === HbsNodeTypes.NullLiteral) {
          return 'null';
        }
        return fn(d, options)
      }).join(' ');
      // Handle hash pairs
      const MustacheHashPairs = mustacheNode.hash?.pairs?.map((pair) => {
        let hashValue = '';
        if (pair.value.type === HbsNodeTypes.UndefinedLiteral) {
          hashValue = 'undefined';
        } else if (pair.value.type === HbsNodeTypes.NullLiteral) {
          hashValue = 'null';
        } else {
          hashValue = fn(pair.value, options);
        }
        return `${pair.key}=${hashValue}`;
      }).join(' ');

      const allMustacheArgs = [mustacheParams, MustacheHashPairs].filter(Boolean).join(' ');

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
        allMustacheArgs ? ' ' + allMustacheArgs : ''
      }${closingBraces}`;
      break;

    case HbsNodeTypes.ContentStatement:
      // @ts-ignore
      output = (node as hbs.AST.ContentStatement).original;
      break;

    case HbsNodeTypes.PathExpression:
      output = (node as hbs.AST.PathExpression).original;
      break;

    case HbsNodeTypes.SubExpression:
      const subExpNode = node as hbs.AST.SubExpression;
      const subParams = subExpNode.params
        .map((param, index) => {

          if (param.type === HbsNodeTypes.UndefinedLiteral) {
            return 'undefined';
          } else if (param.type === HbsNodeTypes.NullLiteral) {
            return 'null';
          }

          if (
            options?.nodeType == HbsNodeTypes.SubExpression
            && options.helper === subExpNode.path.original
            && options?.paramIndex
            && options.paramIndex - 1 === index
            && options?.modifiers
          ) {
            return options.modifiers.map(modify => modify(fn(param, options)));
          } else {
            return fn(param, options);
          }
        })
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

    case HbsNodeTypes.PartialStatement:
    case HbsNodeTypes.PartialBlockStatement:
      const partialNode = node as
        | hbs.AST.PartialStatement
        | hbs.AST.PartialBlockStatement;
      if ('name' in partialNode && partialNode.name.type === 'SubExpression') {
        output = `{{> (${fn(partialNode.name.path, options)}`;
        const params = partialNode.name.params.map(d => fn(d, options));
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
        const params = partialNode.params.map(d => fn(d, options)).join(' ');
        output += ` ${params}`;
      }
      if (partialNode.hash && partialNode.hash.pairs.length > 0) {
        const hash = partialNode.hash.pairs
          .map((p) => `${p.key}=${fn(p.value, options)}`)
          .join(' ');
        output += ` ${hash}`;
      }
      output += ' }}';
      break;

    case HbsNodeTypes.StringLiteral:
      // @ts-ignore
      output = `'${node.value}'`;
      break;

    case HbsNodeTypes.NumberLiteral:
      // @ts-ignore
      output = `${node.value}`;
      break;

    case HbsNodeTypes.BooleanLiteral:
      // @ts-ignore
      output = `${node.value}`;
      break;
    default:
      output = '';
      break;
  }

  return output;
}
