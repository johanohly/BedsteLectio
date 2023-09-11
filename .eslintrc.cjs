module.exports = {
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:perfectionist/recommended-natural',
		'plugin:svelte/recommended'
	],
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte'],
		sourceType: 'module'
	},
	plugins: ['perfectionist', '@typescript-eslint'],
	root: true,
	"rules": {
		"perfectionist/sort-objects": [
			"error",
			{
				"order": "asc",
				"type": "natural"
			}
		]
	}
};
