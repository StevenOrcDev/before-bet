---
id: BB-002
titre: Rendre les frontières de dépendances vérifiables par le lint
epic: EPIC-01
type: tech
statut: review
priorite: P0
estimation: S
depends_on: [BB-001]
assigne: dev-senior
maj: 2026-08-25
---

## Contexte

Une architecture décrite dans un document se dégrade en silence. Une architecture vérifiée par un
lint qui casse la CI ne se dégrade pas. C'est le ticket qui transforme `CLAUDE.md` en contrainte
exécutable, et c'est un des meilleurs arguments à présenter en entretien sur ce projet.

## Objectif

Un import qui viole le sens des dépendances fait échouer `pnpm lint`.

## Critères d'acceptation

### Scénario : le domaine ne peut pas importer un framework
- Étant donné un fichier dans `libs/market-analytics/domain`
- Quand il importe `@nestjs/common`
- Alors `pnpm lint` échoue avec un message nommant la règle de frontière violée

### Scénario : une couche ne peut pas remonter
- Étant donné un fichier dans `libs/market-analytics/domain`
- Quand il importe depuis `libs/market-analytics/infrastructure`
- Alors `pnpm lint` échoue

### Scénario : deux contextes ne se voient pas directement
- Étant donné un fichier dans `libs/market-analytics/application`
- Quand il importe une entité de `libs/match-data/domain`
- Alors `pnpm lint` échoue, l'échange devant passer par un port

### Scénario : la règle est prouvée par un test
- Étant donné le dépôt
- Quand j'exécute la suite de tests
- Alors un test exécute le lint sur des fixtures d'imports interdits et vérifie qu'il échoue bien

## Périmètre technique

Tags Nx (`type:domain`, `type:application`, `type:infrastructure`, `context:<nom>`) posés dans les
`project.json`. Règle `@nx/enforce-module-boundaries` dans la config ESLint racine. Fixtures
d'imports interdits sous un dossier exclu du build.

## Hors périmètre

Les ports et interfaces réels entre contextes (ils viendront avec chaque contexte). Le CI (BB-005).

## Objectif pédagogique

Le concept de *fitness function* architecturale : une contrainte de conception automatiquement
vérifiée. Question à savoir traiter après : quelles autres règles de ce projet mériteraient d'être
transformées en test plutôt qu'en convention ?

## Journal

**2026-08-25 — dev-senior**

Les quatre critères d'acceptation sont couverts, chacun par un test. Sortie de vérification :

```
$ pnpm typecheck && pnpm lint && pnpm test && pnpm build
 Test Files  2 passed (2)
      Tests  5 passed (5)
```

Message obtenu sur une violation réelle :

```
libs/odds/domain/src/__frontieres__/remonte-vers-infrastructure.forbidden.ts
  2:1  error  A project tagged with "type:domain" can only depend on libs tagged
              with "type:domain", "type:shared"   @nx/enforce-module-boundaries
```

**Deux mécanismes, pas un.** C'est l'écart notable par rapport au plan du ticket.

`bannedExternalImports` de Nx, prévu pour interdire `@nestjs/*` dans le domaine, ne s'est pas
déclenché. Raison : Nx ne classe un import comme dépendance externe que si le paquet est
réellement installé. Or NestJS ne l'est pas encore. La règle serait donc restée muette jusqu'au
jour où quelqu'un installe NestJS — c'est-à-dire précisément le jour où on aurait eu besoin d'elle.
Une protection qui n'existe qu'après coup ne protège rien.

Remplacé par `no-restricted-imports`, une règle ESLint standard qui travaille sur la chaîne
d'import sans rien résoudre. Résultat, une séparation nette :

- **Nx `enforce-module-boundaries`** — quel projet interne peut en importer un autre (tags).
- **`no-restricted-imports`** — quel paquet externe est interdit dans quelle couche.

**Les fixtures sont dans de vrais projets.** Elles ne pouvaient pas vivre dans `tools/` : la règle
Nx s'appuie sur les tags du projet auquel appartient le fichier analysé. Elles portent donc
l'extension `.forbidden.ts`, exclue du lint courant et du typecheck — sans quoi le dépôt serait
rouge en permanence. Le test les relit explicitement avec `--no-ignore`.

**Le test vérifie le nom de la règle déclenchée**, pas seulement l'échec du lint. Un fichier peut
échouer pour une tout autre raison (import introuvable, variable inutilisée) et donner un test vert
qui ne prouve rien. Un quatrième test vérifie en sens inverse que le dépôt reste propre.

**Erreur commise en route :** mon dernier test lançait `eslint --no-ignore libs`, ce qui réincluait
les fixtures et faisait échouer le cas censé être vert. Corrigé en séparant deux fonctions,
`lintFixture` et `lintNormal`.

**Reste ouvert.** Les règles de couche interdisent aujourd'hui à `market-analytics` d'importer
`match-data`. Le mécanisme d'échange légitime entre contextes — un port déclaré côté application —
n'existe pas encore : il sera introduit avec le premier besoin réel, dans `BB-011`.

## Ce que j'ai appris

Une règle de lint peut être active, bien configurée, et ne rien protéger : `bannedExternalImports`
était syntaxiquement correct et silencieux. D'où la valeur d'une fixture qui échoue — c'est le seul
moyen de savoir qu'une protection fonctionne vraiment.

Le nom du concept, pour l'entretien : *fitness function* architecturale. Une contrainte de
conception vérifiée automatiquement à chaque exécution, au même titre qu'un test unitaire.
