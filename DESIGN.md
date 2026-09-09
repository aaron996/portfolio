---
name: "Portfolio Lương Thế Vinh — Phase 2 prototype"
description: "Source-derived visual system for the homepage and P&G case review candidate; pending user visual approval."
colors:
  ground: "#132119"
  text: "#f2f5ec"
  secondary: "#c2cdbb"
  line: "#4b5d4d"
  dark: "#0b1510"
  soft: "#1d3024"
  elevated: "#17271d"
  accent: "#d4f236"
  dark-secondary: "#c1cbbc"
  dark-body: "#d5dccc"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.35rem, 4.9vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.09
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.65rem, 2.7vw, 2.35rem)"
    fontWeight: 600
    lineHeight: 1.22
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: 1.65
  action:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
rounded:
  button: "6px"
  image: "10px"
  dialog: "12px"
spacing:
  small: "12px"
  medium: "16px"
  group: "24px"
  column: "36px"
  section-mobile: "48px"
  section: "72px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.dark}"
    typography: "{typography.action}"
    rounded: "{rounded.button}"
    padding: "12px 18px"
  button-outline:
    textColor: "{colors.text}"
    typography: "{typography.action}"
    rounded: "{rounded.button}"
    padding: "12px 18px"
  image-dialog:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.text}"
    rounded: "{rounded.dialog}"
    padding: "20px"
    width: "min(96vw, 1700px)"
---

# Design System: Portfolio Lương Thế Vinh

## Overview

**Creative North Star: "A concise portfolio of operational work"**

This records the built Phase 2 prototype, not an approved final brand palette. It applies only to the homepage and the P&G case inside the `portfolio-v2` surface. The user must review the visual candidate before Phase 3 expands the system. Four other case templates and the game retain their existing design. Token values here describe current code; they do not authorize extension to those surfaces.

The prototype uses a continuous deep-green operational environment, with darker and softer green layers for hierarchy. Product screenshots are its intentionally bright visual material: the evidence the SensorBot and cursor light appear to inspect. Archivo headings give work a clear hierarchy; Inter supports Vietnamese narrative and practical navigation. Lime identifies important actions, focus and moving light without becoming a default background.

**Key Characteristics:**

- Real product imagery with nearby captions and demonstration-data labels.
- Open reading layouts, sentence-case headings, and contextual metadata after titles.
- Dark operational surfaces with quiet tonal shifts around grouped material.
- Visible links, native disclosure controls, and a native image dialog.

Sources: [prototype stylesheet](app/portfolio.css), [components](components/portfolio), [font setup](app/layout.tsx), and [direction contract](docs/portfolio-phase2-direction.md). This is a source extraction; runtime verification and visual approval are reported separately. The companion `.impeccable/design.json` contains component previews and synthetic tonal ramps for its preview panel; those ramps are not implemented palette tokens or approved alternatives.

## Colors

### Primary

**Restrained lime** (`accent`) marks the main hero action, the CV navigation link, the contact email, text selection, focus, and moving light. **Deep green** (`dark`) grounds navigation, image-view controls and the lowest layer of the portfolio surface.

### Neutral

**Ground** (`ground`) supports long reading as a deep green surface. **Soft green** (`soft`) groups process and result material; **elevated green** supports image dialogs. **Pale green** (`text`) carries primary text; **muted green** (`secondary`) carries supporting narrative. **Green-gray** (`line`) divides rows and outlines controls.

**The Surface Scope Rule.** Apply these tokens within the prototype wrapper. The global game and legacy case palette is a separate incumbent system.

## Typography

Archivo is the display family and Inter is the body family, loaded through the existing Next font setup with Vietnamese support. The exact reusable hierarchy is in the frontmatter. Headings balance their line wrapping and use moderately tight tracking; body paragraphs are capped at 72 characters.

Featured project titles use a fluid size between 1.4rem and 1.8rem. Supporting narrative is generally 14px; role metadata and figure captions are 12px. The 11px demonstration label is supplementary to the main caption and must not carry unique essential explanation. Results use Archivo with tabular numerals and a fluid 2rem–3rem scale. The P&G heading uses 2.45rem on mobile.

**The Title Before Metadata Rule.** Introduce each project by its title, then its role or period. Context labels must not compete as decorative headings.

## Layout

The shared shell is capped at 1280px with 56px side gutters. At 1050px and below, gutters become 32px; at 760px and below, they become 20px. Repeated sections use the desktop and mobile section spacing recorded above. Paragraph line length stays bounded even inside wide columns.

Desktop uses unequal heading/body columns and two equal featured-project columns. On mobile the main narratives and featured projects become single columns. The four-step process becomes two columns. Navigation wraps visibly instead of becoming a modal menu. Links used for primary navigation and actions have generous vertical hit areas; main actions have a minimum height of 44px.

The exact homepage sequence and P&G evidence placement remain surface decisions in the [Phase 2 direction contract](docs/portfolio-phase2-direction.md), not requirements for every future page.

## Elevation & Depth

The prototype is flat. It uses deep-green tone shifts, whitespace, and one-pixel dividers rather than drop shadows. The image viewer enters an elevated dark native-dialog layer over a dark translucent backdrop. Grain is disabled while the prototype wrapper is present; the fixed cursor light stays active on fine-pointer devices and follows the cursor across the surface as an intentional part of the portfolio world. The fixed SensorBot 3D stays in the lower-right corner on desktop and turns its lens toward the cursor; it has no pointer events and fades when the cursor comes near it so it does not obstruct reading. Screenshots stay bright, giving the light an object to reveal.

There are no new entrance, hover-translation, or scroll animations in the prototype stylesheet. Disclosure icons rotate directly with the native open state. The sidecar records this behavior without inventing a duration scale.

## Shapes

Narrative sections and result strips retain square geometry. Gentle rounding is reserved for controls, image boundaries, and the dialog using the frontmatter roles. Screenshots preserve their proportions; cropping comes from content metadata and is applied consistently in the page and viewer. Captions remain outside the image boundary.

## Components

### Buttons and links

Primary actions use lime with deep green text. The outline button uses a fine neutral border; both use the shared button shape and padding. Links underline on hover. Keyboard focus uses a two-pixel green outline offset by five pixels on light surfaces and a lime outline on dark navigation, hero, and contact surfaces. This includes the contact region explicitly.

Icons use the shared inline SVG component: 18px size, a 20-unit view box, 1.5-unit stroke, rounded caps and joins, and inherited color. Decorative icons are hidden from assistive technology; visible text provides the action name.

### Navigation

The name and role sit opposite visible navigation links. The CV link has a separating rule and lime text. On mobile, the name and link group stack; links remain available and wrap. The prototype has no hamburger overlay or sticky navigation behavior.

### Project evidence

Featured entries are open image-and-copy compositions, without an outer card shell. The image is a button with an always-visible enlargement label. The project title and separate text link lead to the case; the image button opens its viewer. Captions and demo labels sit immediately below the evidence.

The native dialog supports Escape, a visible close button, click on its surrounding dialog area, scrollable image detail, and return focus to the trigger on close. Opening locks body scrolling; closing and unmounting restore the previous overflow value. It retains the content-defined crop and provides a 1000px minimum image canvas within an independently scrollable region.

### Results and narrative

Result strips use soft green rather than floating KPI cards. Supporting case links use divided text rows. Sources, contribution boundaries, results, and methods stay in the default reading flow.

Technical narrative uses native `details` and `summary` elements with top borders. The plus icon rotates 45 degrees while open; the browser supplies native disclosure interaction. Related cases use full-width divided link rows.

## Do's and Don'ts

### Do:

- **Do** treat these values as the current Phase 2 review candidate until the user approves the visual direction.
- **Do** retain contextual captions, demonstration-data labels, and source/ownership explanations beside the material they qualify.
- **Do** keep title, supporting context, and action distinct in the reading order.
- **Do** preserve clear focus on both light and dark surfaces and text labels alongside icons.
- **Do** use the existing content module for visible copy and accessibility labels.

### Don'ts:

- **Don't** apply the prototype palette globally or expand it to the remaining cases or game before the next phase is approved.
- **Don't** replace actual evidence with invented portraits, testimonials, screenshots, or result data.
- **Don't** make essential evidence or case access depend on hover.
- **Don't** hide result methods, ownership boundaries, or source notes inside optional technical disclosures.
- **Don't** promote surface-specific composition or incidental small text sizes into universal rules for future pages.
