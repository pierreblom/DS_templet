const js = require('@eslint/js');
const globals = require('globals');
const nodePlugin = require('eslint-plugin-node');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 12,
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.jest
            }
        },
        plugins: {
            node: nodePlugin,
            prettier: prettierPlugin
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'prettier/prettier': ['error', { endOfLine: 'auto' }],
            ...prettierConfig.rules
        }
    },
    {
        ignores: ['node_modules/', 'admin/', 'dist/', 'public/', 'admin_panel/']
    }
];
