---
id: BB-013
titre: Règle de résolution BTTS (les deux équipes marquent)
epic: EPIC-05
type: feature
statut: backlog
priorite: P2
estimation: S
depends_on: [BB-012]
assigne: dev-senior
maj: 2026-08-25
---

## Contexte

Deuxième marché le plus consulté après Over/Under. Il sert surtout de **test de l'architecture** :
si l'ajouter demande de modifier autre chose que son propre fichier et le registre, la conception de
BB-011 est à revoir. C'est le ticket qui valide, ou invalide, l'extensibilité du moteur.

## Objectif

Le marché BTTS est résolu correctement, et son ajout n'a nécessité aucune modification du moteur.

## Critères d'acceptation

### Scénario : les deux équipes marquent
- Étant donné un match terminé 2-1
- Quand j'applique le marché BTTS YES
- Alors le verdict est `WON`

### Scénario : une seule équipe marque
- Étant donné un match terminé 3-0
- Quand j'applique le marché BTTS YES
- Alors le verdict est `LOST`

### Scénario : le but contre son camp est attribué à l'équipe bénéficiaire
- Étant donné un match 1-0 dont l'unique but est un contre son camp du défenseur adverse
- Quand j'applique le marché BTTS YES
- Alors le verdict est `LOST`, une seule équipe ayant marqué au sens du marché

### Scénario : l'ajout n'a pas touché le moteur
- Étant donné le diff du ticket
- Quand je liste les fichiers modifiés
- Alors seuls le fichier de la règle, son test et l'enregistrement dans le registre apparaissent

## Périmètre technique

Une règle supplémentaire dans `libs/market-analytics/domain`, plus son enregistrement.

## Hors périmètre

BTTS par mi-temps. Combinaison BTTS et résultat. Statistiques associées.

## Objectif pédagogique

Le principe ouvert/fermé vérifié par le diff plutôt que par l'intention. Question à savoir traiter
après : quel signal indique qu'une abstraction était fausse ?

## Journal

_(rempli par dev-senior)_
