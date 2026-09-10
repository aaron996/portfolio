# B1 stomp asset QA

- Scope: asset-only QA; no game integration was performed.
- Transform: one full-canvas uniform scale 768/1254; no crop or per-frame translation. Target pivot (384,714).
- Alpha: all final files are RGBA, min 0/max 255, with transparent canvas area and partial-alpha edges.
- Visual QA: reviewed on white and dark composites; no baked checkerboard remains in final outputs.
- Identity/scale: frames 1, 2, 3 and 5 were revised from the impact master by pose-only edits to reduce earlier camera/scale drift. Frame 4 is the master impact; frame 6 retains the current transparent raw.
- Limitation: hand-drawn AI frame anatomy remains subject to final art-direction approval; this proves asset QA only, not engine/collider/event integration.

## Per-frame alpha

| Frame | alpha 0 % | partial pixels | bbox | SHA-256 |
|---|---:|---:|---|---|
| 1 | 49.4917 | 295981 | [27, 13, 750, 752] | `ef7f192706ecb12e432b0e3183843250e463480ace78076159c5cac7a5fb265b` |
| 2 | 50.1534 | 292305 | [27, 31, 737, 745] | `4674826fee4f005a19af2addb9ba8d33b7825ae467acbb100e9e4ed3024a1715` |
| 3 | 51.1166 | 286580 | [27, 3, 752, 748] | `edeb8825e2bdcdce2943d4b37fcaedb847162dc1d03e958c0005fbcf33e50813` |
| 4 | 53.0084 | 275201 | [0, 0, 737, 768] | `290e7d08c70e233688da5320cdd902c7b6a6abd0bb134aa41733c4acb7169352` |
| 5 | 47.7336 | 306140 | [0, 20, 748, 745] | `c44cfd53ec5ab34eb544b0dac25d4c82152c750beb1bdb6639eb0f6e1dd5547d` |
| 6 | 42.2672 | 338326 | [0, 25, 758, 768] | `0511b1f1779a24c4abd8c24223a7916abd5c02888e71d4c076b4a065692655bf` |
