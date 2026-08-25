---
id: BB-015
titre: MarketStat - fréquence, intervalle de Wilson et base rate
epic: EPIC-05
type: feature
statut: backlog
priorite: P0
estimation: M
depends_on: [BB-006]
assigne: dev-senior
maj: 2026-08-25
---

## Contexte

C'est le calcul qui porte la promesse du produit. Trois erreurs classiques sont à écarter par
construction : afficher un taux sans son échantillon, utiliser l'approximation normale de
l'intervalle de confiance (fausse sur petit `n` et aux extrêmes, elle peut sortir des bornes
[0, 1]), et présenter une fréquence sans base de référence qui permette de juger si elle est
remarquable.

## Objectif

Un value object qui ne peut pas exister sans sa taille d'échantillon ni son intervalle, et qui
porte sa base de référence.

## Critères d'acceptation

### Scénario : impossible de créer une statistique sans échantillon
- Étant donné une tentative de construire un `MarketStat` avec un échantillon vide
- Quand j'appelle le constructeur
- Alors la création échoue explicitement

### Scénario : intervalle de Wilson correct
- Étant donné 8 réalisations sur 41 observations
- Quand je calcule l'intervalle de Wilson à 95 %
- Alors j'obtiens approximativement [0.102, 0.340], à 0.001 près

### Scénario : les bornes restent dans [0, 1]
- Étant donné 5 réalisations sur 5 observations
- Quand je calcule l'intervalle
- Alors la borne haute vaut 1 au maximum et la borne basse est strictement inférieure à 1

### Scénario : la base de référence accompagne la fréquence
- Étant donné une fréquence de 78 % pour un marché
- Quand je lis le `MarketStat`
- Alors il porte la fréquence de référence du même marché sur la compétition et la période

### Scénario : l'écart non significatif est identifié
- Étant donné une fréquence dont l'intervalle contient la base de référence
- Quand j'interroge la significativité
- Alors la statistique indique que l'écart n'est pas significatif

## Périmètre technique

`MarketStat` dans `libs/market-analytics/domain`, appuyé sur `Probability` et `SampleSize` du
kernel. Implémentation de Wilson avec tests contre des valeurs de référence vérifiées à la main.

## Hors périmètre

Comparaison avec la probabilité implicite d'une cote (EPIC-06). Tout modèle prédictif. Correction
pour comparaisons multiples, à traiter dans un ticket dédié.

## Objectif pédagogique

Pourquoi Wilson plutôt que l'approximation normale, ce qu'un intervalle de confiance dit
réellement, et la notion de base rate. Question à savoir traiter après : que répondre à un
utilisateur qui affirme "100 % sur les 3 derniers matchs" ?

## Journal

_(rempli par dev-senior)_
