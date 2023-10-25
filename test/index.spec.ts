import { convertAstToString } from '../src';
import Handlebars from 'handlebars';
import {
	postprocess,
	preprocess,
	formatNumberSuffix,
} from './index.spec-utils';
import { HbsNodeTypes } from '../src/constants';

describe('convertASTToTemplateString - with out any modification options', () => {
	const templates = [
		// Plain Text
		`Hello,"World!`,

		// Simple Variables
		'Hello, {{name}}!',

		// token with new line
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
		`{{#each items}}
      {{#if isActive}}
      Active: {{name}}
      {{else}}
      {{#if isInactive}}Inactive: {{name}}
      {{/if}}
      {{/if}}
      {{/each}}`,

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

		`{{variable1}}
    {{variable2}}`,
		`Hello, {{name}}! Your account balance is: {{balance}}`,
		`{{#if condition}}
      This content is displayed when the condition is true.
    {{else}}
      This content is displayed when the condition is false.
    {{/if}}`,
		`{{#each items}}
      - {{this}}
    {{/each}}`,
		`{{#with data}}
      {{name}} lives in {{location}}.
    {{/with}}`,
		`The result is {{#if result}}{{result}}{{else}}undefined{{/if}}.`,
		`Today's weather: {{#if rainy}}Rainy{{else if sunny}}Sunny{{else}}Cloudy{{/if}}.`,
		`Today's weather: {{#if rainy}}Rainy{{else unless sunny}}Sunny{{else}}Cloudy{{/if}}.`,
		`Today's weather: {{#if rainy}}Rainy{{else unless sunny}}Sunny{{else if sunny}}Sunny{{else}}Cloudy{{/if}}.`,
		`Today's weather: {{#unless rainy}}Rainy{{else}}Cloudy{{/unless}}.`,
		`Today's weather: {{#unless rainy}}Sunny{{else if sunny}}Rainy{{else}}Cloudy{{/unless}}.`,
		`Today's weather: {{#unless rainy}}Rainy{{else unless sunny}}Sunny{{else if sunny}}Sunny{{else}}Cloudy{{/unless}}.`,
		`{{#unless loggedIn}}
      Please log in to access this feature.
    {{/unless}}`,
		`{{#each users}}
      User: {{name}}, Email: {{email}}
    {{/each}}`,
		`{{#if isAdmin}}
      Welcome, Admin!
    {{else}}
      Welcome, Guest!
    {{/if}}`,
		`{{#with person}}
      {{name}} is {{age}} years old.
    {{/with}}`,
		`{{#each items}}
      - {{name}}: {{price}}
    {{/each}}`,
		`{{#if stock}}
      Item is in stock.
    {{else}}
      Item is out of stock.
    {{/if}}`,
		`Total: {{total}}`,
		`{{#unless condition}}
      This content is displayed when the condition is false.
    {{/unless}}`,
		`Welcome, {{#if user}} {{user}} {{else}} Guest {{/if}}!`,
		`{{#each items}}
      {{@index}}. {{this}}
    {{/each}}`,
		`{{#unless active}}
      This account is currently inactive.
    {{/unless}}`,
		`{{#if (gt count 0)}}
      There are items in the cart.
    {{else}}
      The cart is empty.
    {{/if}}`,
		`{{#with contact}}
      Name: {{name}}, Email: {{email}}
    {{/with}}`,
		`{{#if hasPermission}}
      You have permission to access this feature.
    {{else}}
      Access denied.
    {{/if}}`,
		`{{#each products}}
      Product: {{name}}, Price: {{price}}
    {{/each}}`,
		`{{#if (or condition1 condition2)}}
      This content is displayed when either condition1 or condition2 is true.
    {{else}}
      Neither condition is true.
    {{/if}}`,
		`{{#each items}}
      - {{name}}: {{#if inStock}}In Stock{{else}}Out of Stock{{/if}}
    {{/each}}`,
		`{{#with user}}
      Name: {{name}}, Age: {{age}}
    {{/with}}`,
		`The result is {{#if showPrice}}{{price}}{{else}}Not available{{/if}}.`,
		`{{#each orders}}
      Order Number: {{orderNumber}}, Total: {{total}}
    {{/each}}`,
		`{{#unless authenticated}}
      Please log in to view this content.
    {{/unless}}`,
		`{{#if (and condition1 condition2)}}
      This content is displayed when both condition1 and condition2 are true.
    {{else}}
      At least one condition is false.
    {{/if}}`,
		`{{#each items}}
      - {{name}}: {{#if (eq stock 0)}}Out of Stock{{else}}In Stock{{/if}}
    {{/each}}`,
		`{{#with person}}
      Name: {{name}}, Occupation: {{occupation}}
    {{/with}}`,
		`{{#if (neq status 'active')}}
      Account is not active.
    {{else}}
      Account is active.
    {{/if}}`,
		`{{#each messages}}
      Message from {{sender}}: {{text}}
    {{/each}}`,
		`{{#unless (contains roles 'admin')}}
      You do not have admin privileges.
    {{/unless}}`,
		`{{#if (lt count 10)}}
      There are fewer than 10 items.
    {{else}}
      There are 10 or more items.
    {{/if}}`,
		`{{#each reviews}}
      Review by {{author}}: {{content}}
    {{/each}}`,
		`{{#each messages}}
      Message from {{sender}}: {{text}}
    {{/each}}`,
		`{{#unless (startsWith name 'Mr.')}}
      Name does not start with "Mr."
    {{/unless}}`,
		`{{#with product}}
      Product: {{name}}, Category: {{category}}
    {{/with}}`,
		`{{#if (or (equals color 'red') (equals color 'blue'))}}
      The color is either red or blue.
    {{else}}
      The color is not red or blue.
    {{/if}}`,
		`{{#each messages}}
      Message from {{sender}}: {{text}}
    {{/each}}`,
		`{{#if (or (equals age 18) (equals age 21))}}
      You are either 18 or 21 years old.
    {{else}}
      You are neither 18 nor 21 years old.
    {{/if}}`,
		`{{#with person}}
      Name: {{name}}, Occupation: {{occupation}}
    {{/with}}`,
		`{{#if (gteq score 90)}}
      You scored 90 or higher.
    {{else}}
      Your score is less than 90.
    {{/if}}`,
		`{{#each items}}
      - {{name}}: {{#if (lteq quantity 0)}}Out of Stock{{else}}In Stock{{/if}}
    {{/each}}`,
		`{{#if (contains fruit 'apple')}}
      The fruit contains an apple.
    {{else}}
      The fruit does not contain an apple.
    {{/if}}`,
		`{{#each reviews}}
      Review by {{author}}: {{#if (gteq rating 4)}}Highly recommended!{{else}}Needs improvement.{{/if}}
    {{/each}}`,
		`{{#with product}}
      Product: {{name}}, Price: {{price}}
    {{/with}}`,
		`{{#if (neq status 'inactive')}}
      Account is active.
    {{else}}
      Account is inactive.
    {{/if}}`,
		`{{#each users}}
      User: {{name}}, Email: {{email}}
    {{/each}}`,
		`{{#each orders}}
      Order Number: {{orderNumber}}, Total: {{total}}
    {{/each}}`,
		`{{#if (lt count 10)}}
      There are fewer than 10 items.
    {{else}}
      There are 10 or more items.
    {{/if}}`,
		`{{#each reviews}}
      Review by {{author}}: {{content}}
    {{/each}}`,
		`{{#if (endsWith email 'example.com')}}
      This is an example email address.
    {{else}}
      This is not an example email address.
    {{/if}}`,
		`{{#with product}}
      Product: {{name}}, Category: {{category}}
    {{/with}}`,
		`{{#each messages}}
      Message from {{sender}}: {{text}}
    {{/each}}`,
		`{{#if (or (equals age 18) (equals age 21))}}
      You are either 18 or 21 years old.
    {{else}}
      You are neither 18 nor 21 years old.
    {{/if}}`,
		`{{#with person}}
      Name: {{name}}, Occupation: {{occupation}}
    {{/with}}`,
		`{{#if (gteq score 90)}}
      You scored 90 or higher.
    {{else}}
      Your score is less than 90.
    {{/if}}`,
		`{{#each items}}
      - {{name}}: {{#if (lteq quantity 0)}}Out of Stock{{else}}In Stock{{/if}}
    {{/each}}`,
		`{{#each (filter (filter items (id gt 123)) (rating gte 4))}}{{id}}|{{/each}}`,
		`{{#each (filter (filter (sort items) (name eq 'oranges')) (x gt y))}}{{/each}}`,
		`{{#each (filter (sort (filter (sort items) (name eq 'oranges'))) (x gt y))}}{{/each}}`,
		`{{#each (filter (filter (filter items (id gt 123)) (rating gte 4)) (color eq 'red'))}}{{id}}|{{/each}}`,
		`{{#each (filter (filter (filter (sort items) (id gt 123)) (rating gte 4)) (color eq 'red'))}}{{id}}|{{/each}}`,
		`{{#each (filter (filter (sort (filter (sort items) (id gt 123))) (rating gte 4)) (color eq 'red'))}}{{id}}|{{/each}}`,
		`{{#each (sort (filter (filter (sort (filter (sort items) (id gt 123))) (rating gte 4)) (color eq 'red')))}}{{id}}|{{/each}}`,
		`{{#each (filter (filter (filter (filter items (id gt 123)) (rating gte 4)) (color eq 'red')) (price lte 500))}}{{id}}|{{/each}}`,
		`{{#each (filter (filter (filter (filter (sort items) (id gt 123)) (rating gte 4)) (color eq 'red')) (price lte 500))}}{{id}}|{{/each}}`,
		`{{#each (sort (filter items (id gt 123)))}}{{id}}|{{/each}}`,
		`{{#each (sort (sort (filter items (id gt 123))))}}{{id}}|{{/each}}`,
		`{{#each (sort (filter (sort (filter items (price lte 500))) (id gt 123)))}}{{id}}|{{/each}}`,
		// failing tests
		`{{insert_link url text=(lower text)}}`,
		`{{#with person undefined}}{{name}}{{/with}}`,
		`{{#with null}}{{name}}{{/with}}`,
		`{{insert_link url text=text extra=extra}}`,
		`{{insert_link url text=text}}`,
		`{{insert_map search width height map_type zoom zoom=zoom}}`,
		`{{insert_map "india" undefined}}`,
		`{{insert_barcode bar_content format bar_width height margin color bg_color bg_color=bg_color}}`,
		`{{insert_qr url undefined}}`,
		`{{join items "-" lookup="name"}}`,
		`{{format_number number "," "." precision precision=precision2}}`,
		`{{format_number number undefined}}`,
		`{{pad content length pad_with='X' style='prefix' extraHash=extra}}`,
		`{{strip content "." side="left" extraHash=extra}}`,
		`{{#each (split undefined)}}...{{/each}}`,
		`{{replace "A1B2" (regex undefined) "*"}}`,
		`{{capitalize content format=undefined}}`,
		`{{capitalize content input='words'}}`,
		`{{url_formatter content is_url=false extra=extra}}`,
		`{{#grid undefined}}...{{/grid}}`,
		`{{#each (group_by undefined)}}...{{/each}}`,
		`{{#each (filter items '')}}...{{/each}}`,
		`{{#each (filter items undefined)}}...{{/each}}`,
		`{{#each (filter items null)}}...{{/each}}`,
		`{{#each (filter null)}}...{{/each}}`,
		`{{#each (filter undefined)}}...{{/each}}`,
		`{{join employees '/' lookup='name.first'}}`,
		`{{format_date "01-12-2022" format="MM/DD/YY" language=language}}`,
	];

	for (const template of templates) {
		it(`template: ${template}`, () => {
			expect(
				postprocess(convertAstToString(Handlebars.parse(preprocess(template)))),
			).toStrictEqual(template);
		});
	}
});

describe('convertASTToTemplateString - with modification options', () => {
	const templates = [
		{
			input: `{{#each (filter (filter items (id gt 123)) (rating gte 4))}}{{id}}|{{/each}}`,
			output: `{{#each (filter (filter items '(id gt 123)') '(rating gte 4)')}}{{id}}|{{/each}}`,
		},
		{
			input: `{{#each (filter (filter (sort items) (name eq 'oranges')) (x gt y))}}{{/each}}`,
			output: `{{#each (filter (filter (sort items) '(name eq 'oranges')') '(x gt y)')}}{{/each}}`,
		},
		{
			input: `{{#each (filter (sort (filter (sort items) (name eq 'oranges'))) (x gt y))}}{{/each}}`,
			output: `{{#each (filter (sort (filter (sort items) '(name eq 'oranges')')) '(x gt y)')}}{{/each}}`,
		},
		{
			input: `{{#each (filter (filter (filter items (id gt 123)) (rating gte 4)) (color eq 'red'))}}{{id}}|{{/each}}`,
			output: `{{#each (filter (filter (filter items '(id gt 123)') '(rating gte 4)') '(color eq 'red')')}}{{id}}|{{/each}}`,
		},
		{
			input: `{{#each (filter (filter (filter (sort items) (id gt 123)) (rating gte 4)) (color eq 'red'))}}{{id}}|{{/each}}`,
			output: `{{#each (filter (filter (filter (sort items) '(id gt 123)') '(rating gte 4)') '(color eq 'red')')}}{{id}}|{{/each}}`,
		},
		{
			input: `{{#each (filter (filter (sort (filter (sort items) (id gt 123))) (rating gte 4)) (color eq 'red'))}}{{id}}|{{/each}}`,
			output: `{{#each (filter (filter (sort (filter (sort items) '(id gt 123)')) '(rating gte 4)') '(color eq 'red')')}}{{id}}|{{/each}}`,
		},
		{
			input: `{{#each (sort (filter (filter (sort (filter (sort items) (id gt 123))) (rating gte 4)) (color eq 'red')))}}{{id}}|{{/each}}`,
			output: `{{#each (sort (filter (filter (sort (filter (sort items) '(id gt 123)')) '(rating gte 4)') '(color eq 'red')'))}}{{id}}|{{/each}}`,
		},
		{
			input: `{{#each (filter (filter (filter (filter items (id gt 123)) (rating gte 4)) (color eq 'red')) (price lte 500))}}{{id}}|{{/each}}`,
			output: `{{#each (filter (filter (filter (filter items '(id gt 123)') '(rating gte 4)') '(color eq 'red')') '(price lte 500)')}}{{id}}|{{/each}}`,
		},
		{
			input: `{{#each (filter (filter (filter (filter (sort items) (id gt 123)) (rating gte 4)) (color eq 'red')) (price lte 500))}}{{id}}|{{/each}}`,
			output: `{{#each (filter (filter (filter (filter (sort items) '(id gt 123)') '(rating gte 4)') '(color eq 'red')') '(price lte 500)')}}{{id}}|{{/each}}`,
		},
		{
			input: `{{#each (sort (filter items (id gt 123)))}}{{id}}|{{/each}}`,
			output: `{{#each (sort (filter items '(id gt 123)'))}}{{id}}|{{/each}}`,
		},
		{
			input: `{{#each (sort (sort (filter items (id gt 123))))}}{{id}}|{{/each}}`,
			output: `{{#each (sort (sort (filter items '(id gt 123)')))}}{{id}}|{{/each}}`,
		},
		{
			input: `{{#each (sort (filter (sort (filter items (price lte 500))) (id gt 123)))}}{{id}}|{{/each}}`,
			output: `{{#each (sort (filter (sort (filter items '(price lte 500)')) '(id gt 123)'))}}{{id}}|{{/each}}`,
		},
	];
	const options = {
		helper: 'filter',
		nodeType: HbsNodeTypes.SubExpression,
		paramIndex: 2,
		modifiers: [(d: string) => `'${d}'`],
	};

	for (const template of templates) {
		it(`template: ${template.input} - modify ${formatNumberSuffix(
			options.paramIndex,
		)} param of ${options.helper} helper`, () => {
			expect(
				postprocess(
					convertAstToString(
						Handlebars.parse(preprocess(template.input)),
						options,
					),
				),
			).toStrictEqual(template.output);
		});
	}
});
