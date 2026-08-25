import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

/**
 * BB-001, critere d'acceptation 2 : "le TypeScript est reellement strict".
 *
 * On ne se contente pas de declarer les options dans tsconfig.base.json : on compile un
 * fichier concu pour echouer, et on verifie qu'il echoue bien. Une option de compilation
 * qui n'est pas prouvee par un test peut disparaitre d'un refactoring sans que personne
 * ne le remarque.
 */
function compile(projet: string): { code: number; sortie: string } {
  try {
    const sortie = execFileSync(
      process.execPath,
      ['node_modules/typescript/bin/tsc', '-p', projet, '--noEmit'],
      { encoding: 'utf8' },
    );
    return { code: 0, sortie };
  } catch (erreur) {
    const e = erreur as { status?: number; stdout?: string; stderr?: string };
    return { code: e.status ?? 1, sortie: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

describe('configuration TypeScript stricte', () => {
  it('refuse un acces indexe non verifie (noUncheckedIndexedAccess)', () => {
    const { code, sortie } = compile('tools/strictness-fixtures/tsconfig.json');

    expect(code, `la compilation aurait du echouer, sortie :\n${sortie}`).not.toBe(0);
    expect(sortie).toContain('TS18048');
  });
});
