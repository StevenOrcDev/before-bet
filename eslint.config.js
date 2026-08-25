import js from '@eslint/js';
import nx from '@nx/eslint-plugin';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Les frontieres d'architecture de before-bet sont definies ici, et nulle part ailleurs.
 *
 * Deux mecanismes distincts, pour deux questions distinctes :
 *
 *   1. Quel projet interne peut en importer un autre  -> @nx/enforce-module-boundaries,
 *      qui s'appuie sur les tags declares dans chaque project.json.
 *   2. Quel paquet externe est interdit dans une couche -> no-restricted-imports,
 *      une regle ESLint standard. On ne passe PAS par bannedExternalImports de Nx :
 *      Nx ne reconnait un import comme externe que si le paquet est reellement installe,
 *      donc la regle resterait muette tant que le framework n'est pas dans package.json.
 *      Une protection qui ne se declenche qu'une fois le mal fait ne protege rien.
 */
const CONTEXTES = ['catalog', 'match-data', 'odds', 'market-analytics', 'brief', 'identity'];

const groupe = (motifs, message) => ({ group: motifs, message });

/** Le domaine et le kernel sont purs : aucun framework, aucune I/O, aucune validation runtime. */
const INTERDITS_DOMAINE = [
  groupe(['@nestjs/*'], 'Le domaine ne connait aucun framework. Le cablage Nest reste dans les apps.'),
  groupe(
    ['drizzle-orm', 'drizzle-orm/*', 'pg', 'ioredis', 'bullmq'],
    "Le domaine ne connait pas la persistance. Declare un port, implemente-le dans infrastructure.",
  ),
  groupe(['axios', 'node-fetch', 'undici'], "Le domaine ne fait pas d'I/O reseau."),
  groupe(['react', 'react-*', 'react-dom'], "Le domaine n'a rien a voir avec l'affichage."),
  groupe(
    ['zod'],
    'La validation runtime appartient aux frontieres (HTTP, ingestion). Le domaine valide par ses invariants.',
  ),
];

/** La couche application orchestre : elle ne connait ni framework HTTP ni pilote de base. */
const INTERDITS_APPLICATION = [
  groupe(['@nestjs/*'], "Le cablage Nest appartient aux apps, pas aux use-cases."),
  groupe(
    ['drizzle-orm', 'drizzle-orm/*', 'pg', 'ioredis'],
    "L'application depend de ports, pas de pilotes de base de donnees.",
  ),
];

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', '.nx/**', '**/*.forbidden.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.ts'],
    plugins: { '@nx': nx },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // Toutes les contraintes sont appliquees : un import doit satisfaire la regle de
      // couche ET la regle de contexte.
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            // --- Sens des dependances entre couches -------------------------------
            {
              sourceTag: 'type:domain',
              onlyDependOnLibsWithTags: ['type:domain', 'type:shared'],
            },
            {
              sourceTag: 'type:application',
              onlyDependOnLibsWithTags: ['type:application', 'type:domain', 'type:shared'],
            },
            {
              sourceTag: 'type:infrastructure',
              onlyDependOnLibsWithTags: [
                'type:infrastructure',
                'type:application',
                'type:domain',
                'type:shared',
              ],
            },
            {
              sourceTag: 'type:shared',
              onlyDependOnLibsWithTags: ['type:shared'],
            },
            {
              // Une app est un point de composition : elle cable, elle ne contient pas de metier.
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:application',
                'type:infrastructure',
                'type:shared',
                'type:app',
              ],
            },

            // --- Etancheite des bounded contexts ----------------------------------
            ...CONTEXTES.map((contexte) => ({
              sourceTag: `context:${contexte}`,
              onlyDependOnLibsWithTags: [`context:${contexte}`, 'context:shared'],
            })),
            { sourceTag: 'context:shared', onlyDependOnLibsWithTags: ['context:shared'] },
            { sourceTag: 'context:app', onlyDependOnLibsWithTags: ['*'] },
          ],
        },
      ],
    },
  },

  {
    files: ['libs/*/domain/**/*.ts', 'libs/shared/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: INTERDITS_DOMAINE }],
      // Le domaine ne lit jamais l'horloge systeme : c'est ce qui rend les tests temporels
      // deterministes. Une horloge est injectee (voir BB-004).
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
    files: ['libs/*/application/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: INTERDITS_APPLICATION }],
    },
  },

  {
    // Outillage de developpement : scripts Node, sortie console assumee.
    files: ['scripts/**/*.mjs', 'tools/**/*.ts', '*.config.ts', 'eslint.config.js'],
    languageOptions: { globals: globals.nodeBuiltin },
    rules: { 'no-console': 'off' },
  },
);
