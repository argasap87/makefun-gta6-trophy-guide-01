# HEISTBOARD — GTA 6 Trophy Guide & Tracker

[![HEISTBOARD](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![HEISTBOARD rank](https://make.fun/badge/gta6-trophy-guide-01/argasap87/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![HEISTBOARD reward](https://make.fun/badge/gta6-trophy-guide-01/argasap87/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

**69 trophies, 1 corkboard, 0 missed clues — well, 55 trophies, to be exact.** HEISTBOARD is an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze), built for the make.fun bounty [Build the best GTA 6 trophy guide](https://make.fun/bounty/gta6-trophy-guide-01) ([competition page](https://make.fun/c/gta6-trophy-guide-01)).

Every trophy is pinned to the board as a piece of forensic evidence — a numbered Polaroid in its tier lane (Bronze / Silver / Gold / Platinum), joined by red string into narrative threads: the story chain from the opening mission through four chapters to the finale, the five character finales, the money thread, the collectibles thread. Click a Polaroid and its case file opens: the official name, description and grade exactly as PlayStation publishes them, a guide in our own words, and the sources behind every fact.

## What it does

- **The board** — all 55 trophies in tier lanes, numbered in official order, with grade, PSN target counts, and a MISSABLE flag where the official description ties a trophy to one mission or one event. The board rearranges as trophies are solved.
- **Tracker** — tick trophies off; progress saves in the browser (localStorage), with a big progress counter, per-grade counts, and export to a file / import back.
- **Filters** — by kind (story, missable, collectibles, activities, online — the official list has no online trophy, so that filter is honestly empty), by grade, by earned state, and by search.
- **Spoiler guard** — hides story trophy names and descriptions until they are earned.
- **Roadmap to the platinum** — five stages built from the official descriptions only: story chapters, character strands, the finale and 100%, collectibles and exploration, then activities, money and cleanup.
- **Missables** — 17 trophies flagged, with the rule that flagged them and the caveat that the flags are our reading of the official descriptions, not yet checked in-game.
- **Cited guides** — every trophy's guide names its sources beside it: Exophase for the official name, description and grade, PSNProfiles for the PSN count or target where one is listed. Anything not pinned down by the description is labelled as not yet checked in-game instead of guessed.

## How to run it

No build step, no network. Open `app/index.html` in desktop Chrome, or serve `app/` with any static server:

```sh
cd app && python3 -m http.server 8080
# then open http://localhost:8080
```

It works with the network off: every file it loads lives under `app/`. To hand the entry in (the way the grader does it):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` into `out/` and writes `out/dossier.json`.

## Screenshots

Four real renders of the app in a browser (first by name is the cover):

1. `1-cover.jpg` — the solved board: all 55 trophies earned, case closed, with the gold final-mission trophy's case file open.
2. `2-roadmap.jpg` — the roadmap to the platinum, all five stages.
3. `3-missables.jpg` — the 17 missable trophies, flagged with the rule behind them.
4. `4-guide.jpg` — a guide open with its sources, filters and spoiler guard at work.

## Honesty notes

- The game was a day old when this guide was written. Where the official description does not pin a place or a step down, the guide says so rather than inventing a walkthrough.
- No Rockstar logo, official artwork, box art or game screenshots are used anywhere — the look is entirely our own. This is an unofficial fan guide, not affiliated with or endorsed by Rockstar Games or PlayStation.

## Referral

Referred by code `1ae1r9cj`.

## License

MIT — see [LICENSE](LICENSE).
