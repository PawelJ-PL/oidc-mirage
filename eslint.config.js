/* eslint-disable @typescript-eslint/no-require-imports */

const js = require('@eslint/js')
const tseslint = require('typescript-eslint')
const pluginSecurity = require('eslint-plugin-security')

module.exports = [
    js.configs.recommended,
    ...tseslint.configs.strict,
    ...tseslint.configs.stylistic,
    pluginSecurity.configs.recommended,
    {
        files: ['**/*.js', '**/*.ts'],
        ignores: ['eslint.config.js'],
        plugins: {
            tseslint: tseslint,
        },
        rules: {
            '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
            '@typescript-eslint/no-floating-promises': ['error'],
            'require-await': 'error',
            'no-warning-comments': 'error',
            'object-shorthand': ['warn', 'always'],
            'no-console': 'error',
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/consistent-type-exports': 'error',
            '@typescript-eslint/switch-exhaustiveness-check': 'error',
            'security/detect-unsafe-regex': 'error',
            'security/detect-object-injection': 'off',
            '@typescript-eslint/no-unsafe-enum-comparison': 'error',
            '@typescript-eslint/no-import-type-side-effects': 'error',
        },
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.json'],
            },
            sourceType: 'commonjs',
        },
    },
]
