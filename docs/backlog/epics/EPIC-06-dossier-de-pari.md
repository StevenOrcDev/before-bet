---
id: EPIC-06
titre: Dossier de pari (brief)
statut: backlog
priorite: P1
---

## Objectif

Composer le livrable utilisateur : à partir d'un match et d'un marché, sélectionner les angles
statistiques pertinents, les hiérarchiser, et **générer les avertissements**.

## Pourquoi

La valeur perçue n'est pas le pourcentage, c'est l'avertissement : "12 des 41 matchs se sont joués
sans le buteur principal". C'est ce que ne fait aucun concurrent gratuit.

## Périmètre

Sélection des angles, détection des signaux contradictoires, comparaison fréquence observée contre
probabilité implicite dévigguée, règles de génération des warnings, formulation neutre.

## Hors périmètre

Rendu visuel (EPIC-08). Aucune formulation incitative.

## Critères de sortie

- Un dossier expose toujours : `n`, intervalle, base rate, sources, `asOf`, version des règles.
- Les avertissements sont générés par des règles testées, pas rédigés à la main.
- Un dossier sur échantillon insuffisant le dit en premier, avant tout chiffre.

## Tickets

BB-050 a BB-056
