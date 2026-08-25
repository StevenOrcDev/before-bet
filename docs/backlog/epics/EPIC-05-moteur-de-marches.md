---
id: EPIC-05
titre: Moteur de marchés et statistiques (market-analytics)
statut: backlog
priorite: P0
---

## Objectif

Le coeur du produit. Pour un couple (marché de pari, contexte), produire une fréquence observée
accompagnée de sa taille d'échantillon, de son intervalle de confiance et de sa base de référence.

## Pourquoi

C'est le seul epic qui n'est pas remplaçable par un service tiers. Toute la valeur défendable du
produit, et tout l'intérêt technique du projet, se trouve ici.

## Périmètre

`BettingMarket` (union discriminée), `ResolutionRule` **versionnée** et son registre, `ComparableSet`
(filtres contextuels et seuil de `n` minimal), `MarketStat` (fréquence, intervalle de Wilson, base rate).
Bornes temporelles `asOf` obligatoires sur toute lecture.

## Hors périmètre

Mise en forme, narration, sélection des angles à afficher (EPIC-06). Aucun modèle prédictif :
on décrit le passé, on ne prédit pas.

## Critères de sortie

- Ajouter un nouveau type de marché ne touche que son fichier de règle et son registre.
- Une requête d'analyse sans `asOf` est impossible à écrire (contrainte de typage, pas convention).
- Un `MarketStat` ne peut pas exister sans `n` ni intervalle : invariant du constructeur, testé.
- Un `ComparableSet` sous le seuil de `n` minimal produit un résultat marqué non exploitable.

## Tickets

BB-010 a BB-019
