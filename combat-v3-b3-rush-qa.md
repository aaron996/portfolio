# Combat V3 — B3 Rush QA

- Canvas: 768×768 RGBA; shared scale `0.556521739`; target pivot `(384,714)`.
- Translation: source camera drift was corrected only vertically per support foot (`+109`, `+109`, `+111`, `+106` px); no crop or per-frame scale.
- Alpha: each source and final file is 0–255; alpha `<=8` was removed, retaining AA values `>=9`.
- Visual review: use the paired light/dark contact sheets and pivot loop.

See `combat-v3-b3-rush-qa.json` for per-file measurements and SHA-256.
