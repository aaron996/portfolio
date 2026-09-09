# Hero trial — 09/09/2026

User-pinned direction: English headline “MAKE SENSE OF DATA. MAKE THINGS WORK.”, contrasting type roles, dark space, persistent cursor-tracking SensorBot. Gaming/game-making belongs to the user; the keyboard represents that. Container uses Maersk blue #42B0D5 (https://designsystem.maersk.com/foundations/themes/maersk/light/static/index.html). No handheld scanner: the user's GHN/Shopee role is office work.

THESIS: A typographic poster with two personal objects, not a generic summary beside dashboard cards.
OWN-WORLD: Original pixel brand mark and pointer-lit pixel field return; ink-dark hero, off-white type, lime light, Maersk-blue container, cream compact keyboard.
STORY: Strong English statement → brief Vietnamese context and work CTA → existing project evidence below.
FIRST VIEWPORT: Four-line asymmetric headline with Archivo Black and Space Grotesk; actual 3D concept objects use the negative space on the right. IBM Plex Mono is restricted to object labels/domain. On mobile, type and the small object scene stack without horizontal overflow.
FORM: Homepage hero/nav only. Objects are procedural Three.js geometry, not AI-generated final GLBs; one demand-rendered scene, semantic links to experience/game, restrained response to label hover/focus, static under reduced motion. SensorBot remains the single fixed object. No new autoplay choreography; pointer pixel field redraws on input/resize only. Hero must remain readable without WebGL or motion.

This is a local review candidate, not approval to expand the design to the other sections or generate a full asset batch. Existing case content and game implementation remain outside this experiment.

## Built trial

- **Type:** Archivo Black 400 carries “MAKE SENSE / OF DATA.”; Space Grotesk 500 carries “MAKE THINGS / WORK.” and also serves the Vietnamese introduction. IBM Plex Mono 400 is used for object links and the domain line. Desktop display size is `clamp(64px, 7.3vw, 106px)`, with 1.04 line height; the last line is lime.
- **Color and form:** ink background `#0c110e`, off-white headline `#f2f1ec`, muted supporting text `#c2cdbb`, and lime `#d4f236`. The corrugated container body is `#42B0D5`; the compact keyboard has cream `#eee8d3` keycaps, dark modifiers and lime accents. Objects use rounded geometric parts; the work CTA is a pill. Original pixel branding and the fixed pointer-follow SensorBot lamp are retained.
- **Layout:** a four-line poster at left and two stacked objects at right, followed by the Vietnamese introduction and links. The shell caps at 1280px. Object/text sizing changes at 1200px and 900px; below 600px the 240px-high object scene stacks under the headline. The domain line hides at 1200px. A short-desktop rule (`min-width: 901px`, `max-height: 760px`) shifts the scene left and reduces its size at the reviewed 1265×712 viewport to address lamp overlap; later width rules can override its dimensions at narrower widths.
- **3D and interaction:** one procedural Three.js concept scene with an orthographic camera and warm/cool/lime lighting; no generated GLB assets. Container and keyboard labels remain semantic links to experience and the game, with at least 44px height and visible keyboard focus. Hover/focus gives the selected object a small eased turn. Rendering is demand-driven, and reduced motion removes that turn. The pixel field redraws on pointer input or resize, ignores touch movement, and suppresses pointer emphasis under reduced motion. Heading and links remain HTML outside the decorative canvas; a scene error boundary removes failed 3D rendering.

## Verification and limits

The final production build after the overlap correction passed (exit 0). Final browser checks at widths 1440, 1280, 1265, 768 and 390 found no horizontal overflow or page errors; headline fonts and the object canvas loaded, container navigation to experience and keyboard Tab+Enter navigation to the game passed. The heading remained visible with reduced motion enabled.

Review identified lamp overlap at 1265×712. After the scoped CSS correction and recapture with the lamp fully loaded, the same independent reviewer scored that finding resolved and returned `ship` for the local hero trial. This verdict closes the named overlap finding only. Capture set: `output/playwright/hero-{1440,1280,1265,768,390}.png`. Preview: http://localhost:3105/. These checks do not establish cross-browser coverage, a forced WebGL-failure test, performance on physical mobile devices, or production deployment.

This file records the local hero trial only. Root `DESIGN.md` and `.impeccable/design.json` retain the previous system documentation; this trial does not authorize durable system adoption or changes to other page content.
