---
id: BB-031
titre: Réconciliation des identifiants entre sources
epic: EPIC-02
type: feature
statut: backlog
priorite: P1
estimation: M
depends_on: [BB-030]
assigne: dev-senior
maj: 2026-08-25
---

## Contexte

Une source écrit "Paris SG", une autre "Paris Saint-Germain", une troisième utilise un identifiant
numérique. Un rapprochement approximatif à base de `trim().toLowerCase()` finit par fusionner deux
entités distinctes ou par en dupliquer une, et le problème n'apparaît que des semaines plus tard,
sous forme de statistiques inexplicables.

## Objectif

Un mapping explicite, versionné et auditable entre les identifiants externes et le référentiel
interne, où l'ambiguïté est signalée plutôt que devinée.

## Critères d'acceptation

### Scénario : un alias connu est résolu
- Étant donné un mapping déclarant que "Paris SG" de la source X désigne l'équipe interne T1
- Quand j'importe un enregistrement portant ce libellé
- Alors il est rattaché à T1

### Scénario : un libellé inconnu ne crée rien silencieusement
- Étant donné un libellé absent du mapping
- Quand j'importe l'enregistrement
- Alors il est placé en attente de réconciliation, aucune entité n'est créée automatiquement, et il
  apparaît dans le rapport d'import

### Scénario : ambiguïté signalée
- Étant donné un libellé correspondant à deux équipes internes candidates
- Quand la réconciliation s'exécute
- Alors elle échoue pour cet enregistrement en listant les candidats, sans en choisir un

### Scénario : historisation des décisions
- Étant donné un mapping modifié
- Quand je consulte l'historique
- Alors je retrouve la valeur précédente, la date et le motif du changement

## Périmètre technique

Table `source_ref` (source, type d'entité, identifiant externe, libellé, identifiant interne,
date d'effet). Service de résolution dans `libs/catalog/application`. Rapport d'import listant les
non-réconciliés. Normalisation utilisée uniquement comme aide à la suggestion, jamais comme
décision automatique.

## Hors périmètre

Rapprochement automatique par similarité de chaînes. Interface d'administration du mapping.

## Objectif pédagogique

Identité d'entité dans un système multi-sources, et pourquoi un système de données doit préférer
échouer bruyamment à deviner. Question à savoir traiter après : quel est le coût réel d'une fusion
erronée de deux équipes, et pourquoi est-il asymétrique par rapport à un import bloqué ?

## Journal

_(rempli par dev-senior)_
