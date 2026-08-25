---
id: BB-004
titre: Socle de tests (Vitest, Testcontainers, horloge injectable)
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

Ce projet est saturé de logique temporelle : bornes `asOf`, fenêtres de forme récente, cotes
historisées. Sans horloge injectable, les tests deviennent instables et on finit par les désactiver.
Sans base réelle en test d'intégration, on teste des mocks de repositories, c'est-à-dire rien.

## Objectif

Écrire un test unitaire pur, un test de use-case avec des ports doublés, et un test d'intégration
sur un vrai Postgres, sans configuration supplémentaire.

## Critères d'acceptation

### Scénario : le temps est déterministe
- Étant donné un test qui fige l'horloge au 12 mars 2025 à 20h00
- Quand le code sous test lit l'heure courante
- Alors il obtient exactement cette valeur, et aucun appel direct à `new Date()` n'existe hors des adapters

### Scénario : test d'intégration sur une base réelle
- Étant donné un test marqué comme test d'intégration
- Quand je l'exécute
- Alors un conteneur Postgres est démarré, migré, utilisé, puis détruit, sans base partagée entre tests

### Scénario : séparation des suites
- Étant donné le dépôt
- Quand j'exécute `pnpm test`
- Alors seuls les tests unitaires et applicatifs s'exécutent, les tests d'intégration étant lancés
  par une commande distincte

### Scénario : une règle de lint interdit l'horloge système dans le domaine
- Étant donné un fichier de `libs/*/domain` qui appelle `Date.now()`
- Quand j'exécute `pnpm lint`
- Alors le lint échoue

## Périmètre technique

Vitest (workspace multi-projets), Testcontainers pour Postgres, port `Clock` dans `shared/kernel`
avec implémentations système et figée, `shared/testing` pour les builders et fixtures.

## Hors périmètre

Tests E2E Playwright (EPIC-08). Fixtures de données de match réelles (EPIC-03).

## Objectif pédagogique

L'injection de dépendance appliquée au temps, et la différence entre un *fake* (implémentation
simplifiée mais réelle) et un *mock* (assertions sur les appels). Question à savoir traiter après :
pourquoi tester un repository contre un mock ne prouve rien ?

## Journal

_(rempli par dev-senior)_
