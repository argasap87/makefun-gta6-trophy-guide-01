// HEISTBOARD — a GTA 6 trophy guide for make.fun (Node 22, standard library only).
//
// The guide itself is plain static files: app/index.html opens in desktop
// Chrome and works with the network off, its trophy list and guides are
// app/data/trophies.json, and screenshots/ holds real renders of the app.
// This program hands the entry in: it copies app/ and screenshots/ from
// beside this file into the output directory and writes dossier.json there,
// the summary the judge reads, using the vendored make.fun library.
//
// vendor/makefun-frontend.ts must stay byte for byte as the kit shipped it:
// the scorer rebuilds the dossier with its own copy and compares the two.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Inside the grader MAKEFUN_OUTPUT_DIR is unset and /output is used.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, "app"), join(outputDir, "app"), { recursive: true });
mkdirSync(join(outputDir, "screenshots"), { recursive: true });
if (existsSync(join(repoRoot, "screenshots"))) {
  cpSync(join(repoRoot, "screenshots"), join(outputDir, "screenshots"), { recursive: true });
}

// The scorer's own caps for this bounty: the dossier text is capped at
// 160 KiB, at most 4 screenshots of at most 256 KiB each, and app/ holds at
// most 993 files and directories totalling at most 48 MiB. buildDossier
// refuses anything past those limits, so a bad build fails here, loudly.
writeFileSync(
  join(outputDir, "dossier.json"),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
