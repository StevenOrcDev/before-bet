# Backlog — règles du jeu

Le backlog est **dans le repo**, en markdown, versionné avec le code. Un ticket qui change et le code
qui l'implémente arrivent dans le même commit : l'historique git raconte l'avancement réel du projet.

## Structure

```
docs/backlog/
  README.md          ce fichier — la convention
  INDEX.md           le board, GÉNÉRÉ. Ne jamais l'éditer à la main.
  epics/EPIC-NN-*.md un epic = un objectif produit livrable, plusieurs tickets
  tickets/BB-NNN-*.md un ticket = une unité de travail, idéalement ≤ 1 journée
```

Régénérer le board après toute modification :

```bash
node scripts/backlog.mjs
```

La commande régénère `INDEX.md` **et** valide le backlog (frontmatter incomplet, statut inconnu,
epic inexistant, dépendance cassée, ticket `ready` sans critères d'acceptation). Elle sort en code 1
si le backlog est incohérent — elle est faite pour tourner en CI.

## Identifiants

- Epics : `EPIC-01` … Jamais réattribué, jamais renuméroté.
- Tickets : `BB-001` … Séquentiel global, indépendant de l'epic. Un ticket abandonné garde son
  numéro avec le statut `dropped` : on ne réécrit pas l'histoire.
- Nom de fichier : `BB-042-titre-en-kebab-case.md`.
- Branche git : `feat/BB-042-titre-court`, `fix/BB-042-...`, `tech/BB-042-...`.
- Commit : `feat(market-analytics): résout les marchés over/under [BB-042]`.

## Frontmatter obligatoire

```yaml
---
id: BB-042
titre: Résolution des marchés Over/Under
epic: EPIC-05
type: feature        # feature | tech | spike | bug | doc | chore
statut: ready        # backlog | ready | in-progress | review | done | blocked | dropped
priorite: P1         # P0 bloquant | P1 prochaine étape | P2 souhaitable | P3 un jour
estimation: M        # XS <1h | S ~2h | M ~½j | L ~1j | XL → À DÉCOUPER
depends_on: [BB-011]
assigne: dev-senior  # po-tech | architecte-senior | dev-senior | steve
maj: 2026-08-25
---
```

Un ticket estimé `XL` n'est pas un ticket, c'est un epic mal découpé. `po-tech` doit le refuser.

## Workflow et qui a le droit de faire quoi

| Transition | Qui | Condition |
|---|---|---|
| création → `backlog` | `po-tech` | idée capturée, même incomplète |
| `backlog` → `ready` | `po-tech` | Definition of Ready satisfaite |
| `ready` → `in-progress` | `dev-senior` | un seul ticket en cours à la fois |
| `in-progress` → `review` | `dev-senior` | Definition of Done technique atteinte |
| `review` → `done` | **steve uniquement** | validation humaine |
| n'importe quel → `blocked` | tout le monde | avec le motif et ce qui débloquerait |

**Aucun agent ne ferme un ticket.** Le passage en `done` est une décision humaine — c'est ce qui
garantit que l'avancement affiché correspond à un avancement constaté.

## Definition of Ready

Un ticket ne passe `ready` que si :

1. Le **contexte** explique pourquoi ce ticket existe (le problème, pas la solution).
2. Les **critères d'acceptation** sont écrits en Gherkin, testables, sans « etc. ».
3. Les **dépendances** sont identifiées et elles-mêmes `done` ou `in-progress`.
4. Le **hors-périmètre** est explicite — c'est lui qui empêche le ticket de gonfler.
5. L'estimation est `L` ou moins.
6. Les décisions structurantes qu'il suppose sont tranchées (ADR existant ou ticket `spike` amont).

## Definition of Done

1. Les critères d'acceptation sont couverts par des tests automatisés, pas par une vérification manuelle.
2. `pnpm typecheck && pnpm lint && pnpm test` vert — sortie collée dans le journal du ticket.
3. Aucune règle de lint désactivée, aucun test skippé pour faire passer.
4. Si le ticket a produit une décision structurante : l'ADR est écrit et lié.
5. Le **journal** du ticket est rempli : ce qui a été fait, ce qui a dévié du plan, ce qui reste.
6. La section **« Ce que j'ai appris »** est remplie — objectif de formation, pas décoration.
7. Statut passé à `review`. C'est steve qui met `done`.

## Types de tickets

- `feature` — comportement visible ou valeur métier livrée.
- `tech` — socle, outillage, refacto structurel. Doit énoncer le bénéfice concret, pas « c'est plus propre ».
- `spike` — question ouverte, **timeboxé**, livrable = une note de décision ou un ADR, jamais du code de production.
- `bug` — comportement observé ≠ comportement attendu. Contient un cas de reproduction.
- `doc` / `chore` — le reste.

## Anti-dérives

- Un ticket = un objectif. « Et pendant qu'on y est… » ouvre un nouveau ticket, pas une rallonge.
- Découverte en cours de route → ticket `backlog` créé immédiatement, et on continue le ticket courant.
- Un ticket `blocked` depuis plus de deux sessions doit être découpé ou abandonné, pas contemplé.
