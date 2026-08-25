---
id: BB-003
titre: Environnement local Docker (Postgres, Redis) et configuration typée
epic: EPIC-01
type: tech
statut: backlog
priorite: P1
estimation: S
depends_on: [BB-001]
assigne: dev-senior
maj: 2026-08-25
---

## Contexte

Le projet manipule beaucoup de données : travailler sur une base SQLite jetable donnerait de
fausses garanties sur les performances et sur le SQL réellement utilisé. On veut le vrai Postgres
dès le premier jour, démarrable en une commande.

## Objectif

`docker compose up -d` fournit un Postgres 17 et un Redis exploitables, et l'application refuse de
démarrer si sa configuration est incomplète.

## Critères d'acceptation

### Scénario : environnement démarrable en une commande
- Étant donné un poste avec Docker
- Quand j'exécute `docker compose up -d`
- Alors un Postgres 17 et un Redis répondent sur les ports documentés dans `.env.example`

### Scénario : configuration manquante détectée au démarrage
- Étant donné une variable d'environnement obligatoire absente
- Quand je démarre `apps/api`
- Alors le processus s'arrête immédiatement en nommant la variable manquante, sans démarrer le serveur

### Scénario : aucun secret dans le dépôt
- Étant donné le dépôt
- Quand je cherche des identifiants de connexion
- Alors seul `.env.example` contient des valeurs, toutes factices, et `.env` est ignoré par git

## Périmètre technique

`docker-compose.yml` avec volumes nommés et healthchecks. Schéma de configuration zod chargé une
seule fois au démarrage, exposé via un module de configuration typé. `.env.example` documenté.

## Hors périmètre

Migrations et schéma de données (EPIC-02). Déploiement, image de production, orchestration.

## Objectif pédagogique

Le principe *fail fast* sur la configuration : mieux vaut un crash au démarrage qu'un `undefined`
qui se propage jusqu'à une requête SQL. Question à savoir traiter après : pourquoi valider la
configuration au démarrage plutôt qu'au premier usage ?

## Journal

_(rempli par dev-senior)_
