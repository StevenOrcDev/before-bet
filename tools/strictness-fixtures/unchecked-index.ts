// Ce fichier DOIT provoquer une erreur de compilation.
// Il est exclu du tsconfig principal et compile uniquement par le test de strictness.

export function premier(valeurs: string[]): string {
  const valeur = valeurs[0];
  // noUncheckedIndexedAccess : valeur est "string | undefined", pas "string".
  return valeur.toUpperCase();
}
