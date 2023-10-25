# Handlebars AST to Template String ![hbs-ast-to-str](https://img.shields.io/npm/v/hbs-ast-to-str?label=hbs-ast-to-str) [![Project Icon](./handlebars-ast-to-str-logo.png)](https://github.com/satyajitnayk/handlebar-ast-to-str)

## Description

This project converts a Converts Handlebars Abstract Syntax Tree (AST) back to template string with processing(optional).

## Installation

```hbs
npm install hbs-ast-to-str
```

## Usage

### JavaScript

- with out any modification options

```javascript
const { convertAstToString } = require('hbs-ast-to-str');
const ast = {
	/* Your Handlebars AST using Handlebars.parse(template_str)*/
};
const template = convertAstToString(ast);
```

```javascript
const { convertAstToString } = require('hbs-ast-to-str');
const ast = {
	/* Your Handlebars AST using Handlebars.parse(template_str)*/
};
const options = {
	helper: 'filter',
	nodeType: HbsNodeTypes.SubExpression,
	paramIndex: 2,
	modifiers: [(d: string) => `'${d}'`],
};
const template = convertAstToString(ast, options);
```

## API

`convertAstToString(node: hbs.AST.Node | null, options: ModificationOptions): string`

# ModificationOptions Interface

The `ModificationOptions` interface is used to define a set of options for making modifications to a specific node or element in a Handlebars.js (Hbs) template. This interface is typically used in the context of custom Handlebars.js helpers or modifiers.

## Interface Properties

- `helper`: A string that specifies the name of the helper function. This property is optional and can be used to associate a modification with a particular helper.

- `nodeType`: An enumeration that represents the type of Handlebars.js node that you want to modify. You can use `HbsNodeType` to specify the node type.

- `paramIndex`: An integer that specifies the index of the parameter you want to modify. This is useful when dealing with helper parameters.

- `modifiers`: An array of functions that define the modifications to be applied. Each function in the array should implement the logic for the modification.

## Usage

Here's an example of how to use the `ModificationOptions` interface in TypeScript:

```typescript
const options = {
	helper: 'customHelper',
	nodeType: HbsNodeType.Block,
	paramIndex: 0,
	modifiers: [
		(parameterValue) => {
			// Implement your modification logic here.
			// Modify the 'parameterValue' as needed.
		},
	],
};
```

Refer to spec file for more details.

## License

MIT
