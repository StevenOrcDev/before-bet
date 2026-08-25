---
id: BB-006
titre: Kernel partagé (Result, Probability, DateRange, SampleSize)
epic: EPIC-01
type: tech
statut: backlog
priorite: P0
estimation: M
depends_on: [BB-001]
assigne: dev-senior
maj: 2026-08-25
---

## Contexte

Une probabilité représentée par un `number` finit tôt ou tard à 1.4, ou confondue avec un
pourcentage. Sur un produit dont la promesse est la rigueur statistique, l'obsession des primitives
n'est pas un détail de style : c'est là que naissent les chiffres faux.

## Objectif

Un socle de value objects et de gestion d'erreurs, sans dépendance framework, utilisable par tous
les contextes.

## Critères d'acceptation

### Scénario : une probabilité invalide ne peut pas exister
- Étant donné une tentative de construire une `Probability` avec la valeur 1.4
- Quand j'appelle le constructeur
- Alors j'obtiens un échec explicite, et aucune instance n'est créée

### Scénario : les erreurs métier ne sont pas des exceptions
- Étant donné une opération de domaine qui échoue
- Quand je l'appelle
- Alors elle retourne un `Result` en échec, typé, sans lever d'exception

### Scénario : un intervalle de dates est toujours ordonné
- Étant donné une tentative de créer un `DateRange` dont la fin précède le début
- Quand j'appelle le constructeur
- Alors la création échoue

### Scénario : le kernel est pur
- Étant donné les fichiers de `libs/shared/kernel`
- Quand j'exécute le lint
- Alors aucun import de NestJS, de Drizzle, de client HTTP ou de l'horloge système n'est autorisé

## Périmètre technique

`Result<T, E>` avec helpers (`map`, `flatMap`, `unwrapOr`), `Probability`, `Percentage`,
`SampleSize`, `DateRange`, `Clock`. Tests unitaires exhaustifs sur les bornes.

## Hors périmètre

`Odds` et `ImpliedProbability` (BB-020, BB-021). `MarketStat` et l'intervalle de Wilson (BB-015).
Tout ce qui est spécifique à un contexte n'a rien à faire dans le kernel.

## Objectif pédagogique

Value object, invariant de constructeur, et le piège du *shared kernel* fourre-tout. Question à
savoir traiter après : à quel critère décide-t-on qu'un type mérite le kernel plutôt que le
contexte qui l'a créé ?

## Journal

_(rempli par dev-senior)_
