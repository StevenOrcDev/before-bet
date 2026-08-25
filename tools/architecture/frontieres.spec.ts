import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

/**
 * BB-002, critere d'acceptation 4 : la regle de frontieres est prouvee par un test.
 *
 * Les fixtures sont de vrais fichiers, places dans de vrais projets — c'est indispensable,
 * la regle Nx s'appuie sur les tags du projet auquel appartient le fichier. Elles portent
 * l'extension `.forbidden.ts`, exclue du lint courant et du typecheck : sans ca, le depot
 * serait rouge en permanence. Le test les relit explicitement avec --no-ignore.
 *
 * On verifie le nom de la regle declenchee, pas seulement l'echec : un fichier peut echouer
 * pour une tout autre raison (import introuvable, variable inutilisee) et donner un test
 * vert qui ne prouve rien.
 */
const REGLE = '@nx/enforce-module-boundaries';

function executerEslint(args: string[]): { code: number; sortie: string } {
  try {
    const sortie = execFileSync(process.execPath, ['node_modules/eslint/bin/eslint.js', ...args], {
      encoding: 'utf8',
    });
    return { code: 0, sortie };
  } catch (erreur) {
    const e = erreur as { status?: number; stdout?: string; stderr?: string };
    return { code: e.status ?? 1, sortie: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

/** Relit une fixture normalement exclue du lint. */
const lintFixture = (fichier: string) => executerEslint(['--no-ignore', fichier]);

/** Lint normal, fixtures exclues comme au quotidien. */
const lintNormal = (chemin: string) => executerEslint([chemin]);

describe('frontieres de dependances', () => {
  it('refuse au domaine de remonter vers infrastructure', () => {
    const { code, sortie } = lintFixture(
      'libs/odds/domain/src/__frontieres__/remonte-vers-infrastructure.forbidden.ts',
    );

    expect(code, `le lint aurait du echouer, sortie :\n${sortie}`).not.toBe(0);
    expect(sortie).toContain(REGLE);
  });

  it('refuse au domaine d importer un framework', () => {
    const { code, sortie } = lintFixture(
      'libs/odds/domain/src/__frontieres__/importe-nestjs.forbidden.ts',
    );

    // Ici c'est no-restricted-imports qui protege, pas Nx : voir le commentaire en tete
    // de eslint.config.js. Nx ne verrait cet import que si @nestjs/common etait installe.
    expect(code, `le lint aurait du echouer, sortie :\n${sortie}`).not.toBe(0);
    expect(sortie).toContain('no-restricted-imports');
  });

  it('refuse a un contexte d importer l entite d un autre contexte', () => {
    const { code, sortie } = lintFixture(
      'libs/market-analytics/application/src/__frontieres__/traverse-un-contexte.forbidden.ts',
    );

    expect(code, `le lint aurait du echouer, sortie :\n${sortie}`).not.toBe(0);
    expect(sortie).toContain(REGLE);
  });

  it('laisse passer le depot tel quel', () => {
    const { code, sortie } = lintNormal('libs');

    expect(code, `le lint du depot devrait etre vert, sortie :\n${sortie}`).toBe(0);
  });
});
