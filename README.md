# Handlebars AST to Template String

## Description

This project converts a Handlebars Abstract Syntax Tree (AST) back into its original template string.

## Installation

```hbs
npm install hbs-ast-to-template
```

## Usage

### JavaScript

```javascript
const {convertAstToString} = require('hbs-ast-to-template');
const ast = {/* Your Handlebars AST using Handlebars.parse(template_str)*/};
const template = convertAstToString(ast);
```

## API

`convertAstToString(node: hbs.AST.Node | null): string`

## License

MIT
