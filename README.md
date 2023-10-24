# Handlebars AST to Template String ![hbs-ast-to-str](https://img.shields.io/npm/v/hbs-ast-to-str?label=hbs-ast-to-str) [![Project Icon](./handlebars-ast-to-str-logo.png)](https://github.com/satyajitnayk/handlebar-ast-to-str)

## Description

This project converts a Handlebars Abstract Syntax Tree (AST) back into its original template string.

## Installation

```hbs
npm install hbs-ast-to-str
```

## Usage

### JavaScript

```javascript
const { convertAstToString } = require('hbs-ast-to-str');
const ast = {
  /* Your Handlebars AST using Handlebars.parse(template_str)*/
};
const template = convertAstToString(ast);
```

## API

`convertAstToString(node: hbs.AST.Node | null): string`

## License

MIT
