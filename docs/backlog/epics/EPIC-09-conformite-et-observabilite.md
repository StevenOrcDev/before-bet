---
id: EPIC-09
titre: Conformité, jeu responsable et observabilité
statut: backlog
priorite: P1
---

## Objectif

Rendre le produit défendable : cadre légal français respecté, et comportement du système observable
en production.

## Pourquoi

Sur le marché français, décrire des statistiques est légal ; recommander un pari ou renvoyer vers un
opérateur fait basculer dans le champ de l'ANJ. La frontière se tient dans le code et dans les
formulations, pas dans un paragraphe de CGU. C'est traité comme une exigence fonctionnelle.

## Périmètre

Mentions obligatoires, 18+, message de jeu responsable, revue systématique des formulations
(interdiction du vocabulaire incitatif), politique de sources de données, RGPD sur les comptes.
Côté technique : logs structurés, métriques, traçabilité de la fraîcheur des données, alerte sur
échec d'ingestion.

## Critères de sortie

- Un test automatisé échoue si un vocabulaire incitatif interdit apparaît dans une sortie utilisateur.
- Toute donnée servie expose sa date de dernier rafraîchissement.
- Un échec d'ingestion est visible sans consulter les logs à la main.

## Tickets

BB-080 a BB-088
