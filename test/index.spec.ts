import { convertAstToString } from '../src';
import Handlebars from 'handlebars';
import { postprocess, preprocess } from './index.spec-utils';

describe('convertASTToTemplateString', () => {
  const templates = [
    // Plain Text
    `Hello,"World!`,

    // Simple Variables
    'Hello, {{name}}!',

    // token with ne line
    `Hello {{name}}!
    How are you?`,

    // Nested Variables
    '{{person.name}} is {{person.age}} years old.',

    // Block Helpers
    '{{#each items}}{{this}}{{/each}}',

    // If-Else
    '{{#if condition}}True{{else}}False{{/if}}',

    // Unless Block
    '{{#unless condition}}Not True{{/unless}}',

    // With Block
    '{{#with person}}{{name}}{{/with}}',

    // Comments
    '{{!-- This is a comment --}}',

    // Partials
    '{{> partialName }}',

    // Dynamic Partials
    '{{> (partialName) }}',

    // Multiple Helpers
    '{{#if isActive}} {{#each items}}{{this}}{{/each}} {{/if}}',

    // Subexpressions
    '{{someHelper (anotherHelper value)}}',

    // HTML Escaping
    '{{{escapedValue}}}',

    // Paths with Special Characters - not working
    '{{[@@#*&%$]}}',

    // Block Params
    '{{#each items as |item index|}} {{item}} {{index}} {{/each}}',

    // Nested Block Helpers with Else
    '{{#each items}}{{this}}{{else}}No items.{{/each}}',

    // Nested each blocks
    '{{#each outer}}{{#each inner}}{{this}}{{/each}}{{/each}}',

    // Nested if-else blocks
    '{{#if outer}}{{#if inner}}True{{else}}Inner False{{/if}}{{else}}Outer False{{/if}}',

    // Custom block helper
    '{{#myBlock someParam}}Content{{/myBlock}}',

    // String Literals
    "{{someHelper 'stringLiteral'}}",

    // Number Literals
    '{{someHelper 42}}',

    // Boolean Literals
    '{{someHelper true}}',

    // Custom helpers with string parameters
    "{{myHelper 'text'}}",

    // Multiple parameters in custom helpers
    '{{myHelper param1 param2}}',

    // Complex Expression
    "{{#if (and (eq type 'type1') (not isLoading))}}Type 1 and not loading{{/if}}",

    // Subexpression with each
    "{{#each (group_by items lookup='lookup')}}{{this}}{{/each}}",

    // Using ../ to reference parent scope
    '{{#each items}}{{../name}}{{this}}{{/each}}',

    // Using @root to reference root
    '{{#each items}}{{@root.globalValue}}{{/each}}',

    // Using @key and @index in each helper
    '{{#each object}}Key: {{@key}}, Index: {{@index}}, Value: {{this}}{{/each}}',

    // Using built-in log helper
    "{{log 'Logging this message'}}",

    // Using lookup helper
    '{{lookup array index}}',

    // Concatenation of variables
    '{{concat var1 var2}}',

    // Long block with nested conditions and each
    '{{#each items}}{{#if isActive}}Active: {{name}}{{else}}{{#if isInactive}}Inactive: {{name}}{{/if}}{{/if}}{{/each}}',

    // Multiple sub-expressions
    '{{helper1 (helper2 (helper3 param))}}',

    // Deeply Nested Expressions
    '{{#each items}}{{#if condition}}{{#unless anotherCondition}}{{this}}{{/unless}}{{/if}}{{/each}}',

    // Single line multiple expressions
    '{{expr1}}{{expr2}}{{expr3}}',

    // Combinations of everything
    '{{#if condition}}{{#each items}}{{helper (lookup ../map key)}}{{/each}}{{else}}Nothing{{/if}}',

    '{{#each (filter items)}}{{/each}}',

    '{{#each (filter items (x gt y))}}{{/each}}',

    '{{#each (filter (sort items) (x gt y))}}{{/each}}',

    '{{#each (filter (sort (sort items)) (x gt y))}}{{/each}}',

    '{{#each (sort (filter (sort (sort items)) (x gt y)) other arguments)}}{{/each}}',

    '{{#each (filter (filter items (id gt 123)) (rating gte 4))}}{{id}}|{{/each}}',

    `{{#each (filter (sort (filter (sort items) (name eq 'oranges'))) (x gt y))}}
    {{id}} | {{name}} | {{price}}
    {{/each}}`,

    '{{#each (filter items (this gt 0))}}...{{/each}}',

    '{{#each (filter items (age gte 18))}}{{id}}{{/each}}',

    '{{#each (filter input.items (this.id ne 1323))}}...{{/each}}',

    `{{#each (filter (sort items) (this.join_date lte '2022-05-13'))}}...{{/each}}`,

    '{{#each (group_by input.items)}}{{/each}}',

    `{{#each (group_by items lookup='name.first')}}{{/each}}`,

    '{{insert_image img}}',

    `{{#each (sort items order='desc' lookup='name')}}...{{/each}}`,

    '{{#each (sort (split items separator))}}...{{/each}}',

    "{{lookup (sort items) 'length'}}",

    "{{lookup (filter items (rating gt 3)) 'length'}}",

    "{{lookup (filter employees (((salary lt 3000) or (salary gte 5000)) and (tag contains 'world'))) 'length'}}",

    "{{lookup (filter employees ((@first eq 1) or (@last neq 4) or (@index in '1,4,5'))) 'length'}}",

    "{{lookup (filter employees (empId eq (pad ../number 3 pad_with='#'))) 'length'}}",

    `{{#each (filter employees ((name eq 'john doe') and (dept in 'HR, Finance') and (salary gt 50000) or (status eq 'active')))}}
    {{tags}} | {{pension.amount}}
    {{/each}}`,

    '{{#each (group_by input.items)}}...{{/each}}',

    `{{#each (group_by items lookup='name.first')}}...{{/each}}`,

    `{{#each (group_by input.items lookup='name.first')}}...{{/each}}`,

    `{{#each (group_by input.employees lookup='role.previous.0.code')}}...{{/each}}`,

    `{{#each (group_by items lookup='category')}}
    {{key}}
    {{#each items}}
    {{name}} {{role.code}}
    {{/each}}
    {{/each}}`,
  ];

  for (const template of templates) {
    it(`template: ${template}`, () => {
      expect(
        postprocess(convertAstToString(Handlebars.parse(preprocess(template))))
      ).toStrictEqual(template);
    });
  }
});
