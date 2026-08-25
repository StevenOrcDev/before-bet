# 0001 — Modélisation de BettingMarket

Statut : accepté
Date : 2026-08-25
Validé le : 2026-08-25
Ticket : `BB-010`

## Contexte

`BettingMarket` est le concept central : règles de résolution, ensembles comparables, statistiques,
cotes, cache, URLs — tout s'y rattache. Une erreur ici se paie sur chaque ticket suivant.

Les marchés sont hétérogènes selon quatre dimensions qui ne se combinent pas librement :

- **portée** — le match entier, une équipe, un joueur ;
- **période** — temps réglementaire, première mi-temps, seconde mi-temps ;
- **question** — franchir un seuil, les deux équipes marquent, résultat à trois issues, handicap ;
- **sélection** — le côté choisi par le parieur.

Toutes les combinaisons ne sont pas valides : « les deux équipes marquent » n'a pas de sens pour un
joueur, « tirs cadrés » n'en a pas pour un match entier. Une modélisation trop générique
(`type: string`, `params: object`) rendrait ces absurdités représentables et déplacerait toute la
vérification à l'exécution.

Trois exigences imposées par des décisions déjà prises pèsent sur ce choix :

1. `BB-021` (dévigging) a besoin du **jeu complet** des sélections mutuellement exclusives d'un même
   marché : on ne peut pas retirer la marge du bookmaker à partir d'une cote isolée.
2. `BB-011` a décidé que les règles de résolution sont des **fonctions pures externes**, pas des
   méthodes du marché.
3. Le principe 5 de `CLAUDE.md` exige que la **version de la règle** voyage avec toute statistique.

## Décision

### 1. Séparer la famille de la sélection

On introduit **`MarketFamily`** — la question posée, sans la réponse — et **`BettingMarket`** — la
famille plus la sélection retenue.

C'est la décision la plus structurante de cet ADR. La famille est ce sur quoi opèrent le dévigging
(`BB-021`) et le regroupement statistique ; le marché est ce que l'utilisateur choisit. Sans cette
distinction, `BB-021` n'a aucun objet sur lequel travailler et finirait par reconstruire ce concept
de façon implicite et divergente.

### 2. Une union discriminée fermée, par variante métier

```ts
type MarketFamily =
  | { kind: 'MATCH_TOTAL';  period: Period; metric: MatchMetric;  line: Line }
  | { kind: 'TEAM_TOTAL';   period: Period; side: Side; metric: TeamMetric; line: Line }
  | { kind: 'PLAYER_TOTAL'; period: Period; playerId: PlayerId; metric: PlayerMetric; line: Line }
  | { kind: 'BOTH_TEAMS_SCORE'; period: Period }
  | { kind: 'MATCH_RESULT';     period: Period }
  | { kind: 'ASIAN_HANDICAP';   period: Period; line: AsianLine }
```

Chaque variante ne déclare que les dimensions qui ont un sens pour elle, et porte son propre type de
métrique. `PLAYER_TOTAL` accepte `sot | shots | goals | assists | cards`, `MATCH_TOTAL` accepte
`goals | corners | cards`. Un marché « tirs cadrés du match » ne compile pas.

`BettingMarket` reprend chaque variante en y ajoutant la sélection admissible : `OVER | UNDER` pour
les totaux, `YES | NO` pour BTTS, `HOME | DRAW | AWAY` pour le résultat, `HOME | AWAY` pour le
handicap. Les sélections sont écrites explicitement dans chaque variante plutôt que dérivées par
type conditionnel : les messages d'erreur du compilateur restent lisibles, ce qui compte davantage
qu'une économie de six lignes.

Le handicap asiatique n'a pas de champ `side` : **la ligne est toujours exprimée du point de vue de
l'équipe à domicile**, et la sélection dit de quel côté on se place. Un `side` en plus d'une ligne
signée permettrait de représenter deux fois le même pari.

### 3. `Line` est un value object au quart de but

Validation : multiple de 0,25, bornes plausibles. Cela couvre les lignes entières (2.0), les demies
(1.5) et les quarts (2.25, -0.25) sans autoriser 1.37.

### 4. Les prolongations n'existent pas

`Period` vaut `FULL_TIME` (90 minutes plus arrêts de jeu), `FIRST_HALF` ou `SECOND_HALF`. Aucune
valeur ne couvre les prolongations ni les tirs au but en v1. L'exclusion est portée par le type,
pas par une condition dans une règle.

### 5. Identité : une clé canonique textuelle

L'égalité de deux marchés est l'égalité de leur clé canonique. Grammaire :

```
<periode>:<portee>:<question>[:<metrique>][:<ligne>]:<selection>
```

```
ft:match:ou:goals:1.50:over
ft:home:ou:corners:4.50:under
ft:match:ah:-0.25:home
ft:match:btts:yes
h1:match:1x2:draw
ft:player-9f2c1a4e:ou:sot:2.50:over
```

ASCII minuscule, ordre des champs fixe, ligne toujours formatée à deux décimales avec signe
explicite pour un handicap. Aucune dépendance à la locale : `1,50` n'existe pas.

Propriété recherchée : **la clé de famille est la clé du marché privée de son dernier segment.**
Le regroupement pour le dévigging et pour les statistiques devient une opération de chaîne triviale
et non ambiguë, y compris côté SQL.

Cette clé est utilisable telle quelle en identifiant d'URL et en clé de cache Redis.

### 6. La version appartient à la règle, pas au marché

Le marché est une **question**, il n'a pas de version : sa clé doit rester stable, sinon les favoris,
les URLs partagées et le cache se brisent à chaque évolution de règle.

C'est le registre de `BB-011` qui associe à chaque `kind` sa règle **et** sa version courante. Toute
statistique produite porte `{ marketKey, ruleVersion, asOf }`. Conséquences opérationnelles :

- la clé de cache inclut `ruleVersion` : un incrément invalide mécaniquement les résultats obsolètes ;
- les agrégats stockés portent leur `ruleVersion` : un job de recalcul cible exactement les lignes
  périmées, et un mélange de versions est détectable par requête plutôt qu'invisible.

## Cas difficiles tranchés

| Cas | Décision | Motif |
|---|---|---|
| Handicap au quart (-0.25) | Ligne de première classe. La division en deux demi-mises vit dans la **règle**, qui renvoie `HALF_WON` / `HALF_LOST` | Le vocabulaire de verdicts de `BB-011` le permet déjà. Éclater le marché en deux sous-paris rendrait son identité et son URL instables alors que l'utilisateur, lui, a choisi « -0.25 » |
| Ligne entière (2.0) | `VOID` | Déjà couvert par les critères d'acceptation de `BB-012` |
| Marchés joueur | **Modélisés, non supportés en v1** : le registre les déclare sans règle | Ils exigent des données événementielles (`EPIC-03`) que football-data.co.uk ne fournit pas. Les modéliser maintenant évite une refonte de l'union ; ne pas les résoudre évite de mentir sur la couverture |
| Marchés à trois issues | Supportés | Aucune difficulté structurelle, mais c'est le cas qui a imposé `MarketFamily` |
| Prolongations, tirs au but | Hors modèle | Voir décision 4 |
| Combinaisons valides mais sans données (corners en première mi-temps) | Représentables, refusées par le **registre** | Voir conséquences |

## Alternatives écartées

**Composition orthogonale intégrale** — un unique type `{ scope, period, question, selection }`.
Extensible et sans duplication, mais rend représentables les combinaisons absurdes : un joueur
associé à « les deux équipes marquent » compilerait. La validation glisse vers l'exécution, ce qui
est exactement ce que ce projet cherche à éviter. Écarté.

**Hiérarchie de classes polymorphes**, chaque marché sachant se résoudre. Colocaliser la règle avec
le marché contredit `BB-011` (règles pures externes), force le marché à connaître `MatchFacts`,
complique la sérialisation vers la base et le cache, et rend le versionnement d'une méthode
inexprimable. Écarté.

**Table de configuration en base**, marchés déclarés en données. Permet d'ajouter un marché sans
déployer, mais supprime toute vérification à la compilation et n'évite pas d'écrire la règle en
code. Le bénéfice ne se matérialiserait qu'avec des dizaines de marchés. Prématuré. Écarté.

## Conséquences

**Positives.** Les combinaisons invalides ne compilent pas. Ajouter un type de marché provoque une
erreur de compilation à chaque endroit qui doit le traiter — c'est recherché, pas subi. La clé
canonique donne gratuitement l'identifiant d'URL, la clé de cache et la clé de regroupement SQL.
Le dévigging et la statistique ont enfin un objet commun : la famille.

**Négatives, assumées.**

- L'union grandit avec le catalogue. Chaque nouveau `kind` touche l'union, le registre et les
  branchements exhaustifs. Le coût est réel et il est le prix de la sécurité de type.
- `period` est répété dans chaque variante. Duplication acceptée : la factoriser rouvrirait la porte
  aux combinaisons absurdes.
- Une combinaison peut compiler sans qu'aucune donnée ne l'alimente. Le registre doit donc déclarer
  les triplets `(kind, metric, period)` réellement supportés, et **échouer au démarrage** sur une
  incohérence. C'est le seul garde-fou qui reste à l'exécution, et il est concentré en un point.
- La clé canonique devient un **contrat public** : URLs partagées, favoris, cache. En changer le
  format casse ces trois choses à la fois. Toute évolution devra donc être versionnée elle-même.
- Une clé de marché joueur contient un UUID : illisible et longue. Acceptable pour un identifiant,
  à ne jamais exposer comme libellé.

## Impacts sur le backlog

À traiter par `po-tech`, sans quoi ces tickets partiront sur une base fausse :

- `BB-011` — doit intégrer `MarketFamily`, le registre des combinaisons supportées et le contrôle au
  démarrage. Son estimation `M` est probablement à revoir.
- `BB-021` — le dévigging opère sur une **famille**, pas sur un marché. Le vocabulaire du ticket est
  à corriger.
- `BB-014`, `BB-015` — les statistiques sont clés par `marketKey` et portent `ruleVersion`.
- **Nouveau ticket suggéré** — « Clé canonique de marché : sérialisation, parsing et propriété
  aller-retour ». La grammaire, le formatage décimal et le parsing robuste représentent un travail
  distinct de la modélisation, avec ses propres cas limites. L'ajouter à `BB-011` le ferait déborder.

## Ce que tu retiens

Le pattern est l'**union discriminée fermée** couplée à la maxime « rendre les états illégaux non
représentables ». Il est surdimensionné quand le domaine n'a que deux ou trois variantes stables :
un booléen suffit alors.

La distinction **famille / sélection** est une leçon plus générale : un besoin situé en aval
(le dévigging) a révélé un concept manquant en amont. C'est le signe habituel qu'un concept métier
existe dans la réalité sans avoir encore de nom dans le code.

Question à savoir traiter avant `BB-011` : comment garantir qu'ajouter un `kind` fasse **échouer la
compilation** partout où il faut le traiter, plutôt que de passer silencieusement dans un `default` ?
