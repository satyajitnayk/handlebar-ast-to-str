export const HbsNodeTypes = {
  Program: 'Program',
  BlockStatement: 'BlockStatement',
  MustacheStatement: 'MustacheStatement',
  ContentStatement: 'ContentStatement',
  CommentStatement: 'CommentStatement',
  PathExpression: 'PathExpression',
  SubExpression: 'SubExpression',
  PartialStatement: 'PartialStatement',
  PartialBlockStatement: 'PartialBlockStatement',
  StringLiteral: 'StringLiteral',
  NumberLiteral: 'NumberLiteral',
  BooleanLiteral: 'BooleanLiteral',
  UndefinedLiteral: 'UndefinedLiteral',
  NullLiteral: 'NullLiteral'
};

export type HbsNodeType = typeof HbsNodeTypes[keyof typeof HbsNodeTypes];
