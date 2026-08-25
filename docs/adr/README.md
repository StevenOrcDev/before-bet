# Architecture Decision Records

Toute décision structurante du projet est tracée ici : découpage, modélisation d'un concept métier,
choix de technologie, stratégie de cohérence ou de cache. Un ADR est court, daté, et **honnête sur
ses inconvénients** — un ADR qui ne liste que des avantages est un ADR faux.

## Format

`NNNN-titre-court.md`, numérotation séquentielle, jamais réattribuée.

```markdown
# NNNN — Titre

Statut : proposé | accepté | remplacé par NNNN
Date : AAAA-MM-JJ

## Contexte
Ce qui rend la décision nécessaire. Les contraintes réelles, pas la solution.

## Décision
Ce qui est décidé, formulé à l'actif.

## Alternatives écartées
Chacune avec le motif du rejet.

## Conséquences
Les effets positifs, les effets négatifs, et ce qu'on s'interdit désormais.
```

## Règles

- Un ADR n'est jamais modifié une fois accepté. Une décision qui change donne un **nouvel** ADR qui
  remplace l'ancien, dont le statut passe à « remplacé par NNNN ».
- Le ticket qui a produit la décision référence l'ADR dans son périmètre technique, et
  réciproquement.
- Rédaction par `architecte-senior`.

## Index

| ADR | Titre | Statut | Ticket |
|---|---|---|---|
| [0001](0001-modelisation-betting-market.md) | Modélisation de `BettingMarket` | accepté | `BB-010` |
