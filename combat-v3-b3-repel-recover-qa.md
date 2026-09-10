# Combat V3 — B3 Repel & Recover QA

- Canvas: 768×768 RGBA; pivot `(384,714)`; support foot anchored to y=714.
- Fixed-part review: clock face, crown, purple casing and silver cuffs retained. Source canvas sizes differed, so the alpha-gt-32 visual silhouette was measured and normalized to 704 px; no final artwork was cropped.
- Alpha: all delivery files have alpha 0–255. Values `<=8` were cleaned after resampling while higher AA values remain.
- Exception: `b3-repel-2` had two ImageGen background-only edits that returned an opaque checkerboard. Raw outputs are retained; a corner-connected, neutral-checkerboard local matte was used and checked on light/dark previews.

See `combat-v3-b3-repel-recover-qa.json` for every transform, alpha measurement and SHA-256.
