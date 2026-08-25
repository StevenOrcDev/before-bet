---
id: EPIC-08
titre: Application web
statut: backlog
priorite: P2
---

## Objectif

Une interface où l'utilisateur part d'un marché de pari et lit un dossier compréhensible en
30 secondes, incertitude comprise.

## Périmètre

React 19, Vite, TanStack Router et Query, Tailwind, dataviz (distribution des buts, évolution de la
cote, fréquence avec sa barre d'incertitude). Recherche de match, sélection du marché.

## Hors périmètre

Tout calcul statistique côté client. Le front met en forme, il n'interprète pas.

## Critères de sortie

- L'intervalle de confiance et la taille d'échantillon sont visibles **sans interaction**.
- Chaque graphique a une alternative textuelle ou tabulaire accessible.
- Aucun `useEffect` avec `fetch` manuel pour de l'état serveur.

## Tickets

BB-070 a BB-078
