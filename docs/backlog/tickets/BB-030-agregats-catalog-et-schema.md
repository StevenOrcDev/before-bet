---
id: BB-030
titre: Agrégats du référentiel et schéma Postgres
epic: EPIC-02
type: feature
statut: backlog
priorite: P0
estimation: L
depends_on: [BB-003, BB-006]
assigne: dev-senior
maj: 2026-08-25
---

## Contexte

Toute statistique agrège des matchs, des équipes et des joueurs. Si ces entités n'ont pas
d'identité stable, les agrégations mélangent des choses différentes sans que rien ne le signale.
Le référentiel est la fondation invisible du produit.

## Objectif

Un modèle de référentiel persistant, migré, avec des identifiants internes stables et
indépendants de toute source externe.

## Critères d'acceptation

### Scénario : identifiants internes indépendants des sources
- Étant donné une équipe créée dans le référentiel
- Quand je lis son identifiant
- Alors il est généré par le système et ne dérive d'aucun identifiant de source externe

### Scénario : un match relie deux équipes à une date et une compétition
- Étant donné une `Fixture`
- Quand je la lis
- Alors elle porte l'équipe à domicile, l'équipe à l'extérieur, la compétition, la saison, et une
  date en UTC accompagnée du fuseau du lieu

### Scénario : un match ne peut pas opposer une équipe à elle-même
- Étant donné une tentative de créer une `Fixture` avec la même équipe des deux côtés
- Quand j'appelle le constructeur
- Alors la création échoue

### Scénario : les migrations sont rejouables
- Étant donné une base vide
- Quand j'exécute les migrations puis les rejoue
- Alors le schéma est identique et aucune erreur n'est levée

### Scénario : le domaine ignore le schéma
- Étant donné les fichiers de `libs/catalog/domain`
- Quand j'exécute le lint
- Alors aucun import de Drizzle n'est autorisé, le mapping vivant uniquement dans `infrastructure`

## Périmètre technique

Agrégats `Competition`, `Season`, `Team`, `Player`, `Fixture` dans `libs/catalog/domain`. Schéma
Drizzle et migrations dans `libs/catalog/infrastructure`. Repositories implémentant les ports
déclarés par `application`. Tests d'intégration sur Testcontainers.

## Hors périmètre

La réconciliation d'identifiants entre sources (BB-031). L'import de données réelles. Les
événements de match (EPIC-03).

## Objectif pédagogique

Frontière agrégat / table, mapping explicite plutôt qu'ORM à decorators dans le domaine, et
stockage du temps (UTC plus fuseau du lieu). Question à savoir traiter après : pourquoi un
identifiant interne plutôt que la clé de la source principale ?

## Journal

_(rempli par dev-senior)_
