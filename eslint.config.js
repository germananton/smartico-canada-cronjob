const airbnbConfig = require('eslint-config-airbnb-base');
const prettierConfig = require('eslint-config-prettier');
const importConfig = require('eslint-plugin-import');
const jestConfig = require('eslint-plugin-jest');
const securityConfig = require('eslint-plugin-security');
const globals = require('globals');
const js = require('@eslint/js');

/** @type {import('eslint').Linter.Config} */
module.exports = [
	{
		plugins: {
			airbnb: airbnbConfig,
			prettier: prettierConfig,
			import: importConfig,
			jest: jestConfig,
			security: securityConfig,
		},
		ignores: ['.pnp.*', '.yarn/*', 'bin/**', 'node_modules/**'],
		files: ['**/*.js'],
		languageOptions: {
			ecmaVersion: 2022,
			globals: {
				...globals.node,
				...globals.commonjs,
				...globals.jest,
			},
		},
		rules: {
			semi: 'error',
			...js.configs.recommended.rules,
			...jestConfig.configs.recommended.rules,
			...securityConfig.configs.recommended.rules,
			...prettierConfig.rules,
			'import/no-extraneous-dependencies': [
				'error',
				{
					devDependencies: [
						'**/tests/**/*.js',
						'eslint.config.js',
						'.devops/**/*',
					],
				},
			],
			'prefer-const': 'error',
			'no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],
			'no-console': 'off',
			'jest/expect-expect': 'off',
			'security/detect-object-injection': 'off',
			'global-require': 'error',
			'no-await-in-loop': 'error',
			'jest/valid-expect': ['error', { alwaysAwait: true }],
		},
	},
];
