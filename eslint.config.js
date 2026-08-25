import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', '.nx/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      // Principes non negociables de CLAUDE.md, rendus executables.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Le domaine ne lit jamais l'horloge systeme : c'est ce qui rend les tests temporels
    // deterministes. Une horloge est injectee (voir BB-004).
    files: ['libs/*/domain/**/*.ts'],
    rules: {
      'no-restricted-globals': ['error', { name: 'Date', message: 'Injecte une horloge (port Clock).' }],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message: 'Date.now() est interdit dans le domaine : injecte une horloge (port Clock).',
        },
        {
          selector: "NewExpression[callee.name='Date']",
          message: 'new Date() est interdit dans le domaine : injecte une horloge (port Clock).',
        },
      ],
    },
  },
  {
    // Outillage de developpement : scripts Node, sortie console assumee.
    files: ['scripts/**/*.mjs', 'tools/**/*.ts', '*.config.ts', 'eslint.config.js'],
    languageOptions: { globals: globals.nodeBuiltin },
    rules: { 'no-console': 'off' },
  },
);
