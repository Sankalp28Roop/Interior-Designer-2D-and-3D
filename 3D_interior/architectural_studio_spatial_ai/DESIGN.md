---
name: Architectural Studio & Spatial AI
colors:
  surface: '#111317'
  surface-dim: '#111317'
  surface-bright: '#37393e'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#e7c17c'
  on-secondary: '#412d00'
  secondary-container: '#5c4308'
  on-secondary-container: '#d4b06d'
  tertiary: '#d4cec0'
  on-tertiary: '#333026'
  tertiary-container: '#b8b3a5'
  on-tertiary-container: '#48453a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#ffdea4'
  secondary-fixed-dim: '#e7c17c'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5c4308'
  tertiary-fixed: '#e8e2d3'
  tertiary-fixed-dim: '#cbc6b8'
  on-tertiary-fixed: '#1d1c12'
  on-tertiary-fixed-variant: '#49473c'
  background: '#111317'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
typography:
  display-lg:
    fontFamily: DM Sans
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: DM Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: DM Sans
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: DM Sans
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: DM Sans
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  headline-sm:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.06em
  code-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system establishes a high-precision, technical atelier environment tailored for interior architects, spatial computing designers, and 3D environment artists. It merges the austere, deliberate precision of physical architectural drafting rooms with modern computational workflows. 

The aesthetic is anchored in an engineering-forward architectural dark mode. Rather than an overwhelming sci-fi interface, it delivers a tactile, deliberate, and studio-grade workspace. Deep slate bedrock surfaces contrast with metallic brass references, concrete neutrals, and micro-fine hairpins to invoke physical blueprints, laser meters, and museum-grade finishes. The interface recedes into the background to spotlight spatial viewports, lighting simulations, and material renders.

## Colors
The palette is calibrated for long studio sessions under controlled lighting, prioritizing zero eye fatigue alongside rapid chromatic recognition.

- **Primary (`#D4AF37`)**: Warm architectural brass. Used selectively for active tool selections, focal measurement nodes, key generation triggers, and critical spatial indicators.
- **Secondary (`#E5C07B`)**: Champagne highlight. Utilized for secondary action states, coordinate badges, active toggles, and contextual highlights within 3D viewports.
- **Tertiary (`#8C887B`)**: Muted concrete / raw plaster. Supports secondary metadata, dimension lines, unselected viewport handles, and inactive iconography.
- **Neutral (`#0F1115`)**: Deep slate foundation. Accompanied by surface step-ups at `#171A21` (panels) and `#212631` (floating HUD toolbars) with soft bouclé text accents (`#EAE6DF`) for primary legibility.

## Typography
Typography reflects the strict discipline of architectural title blocks and cad drafting interfaces. 

`DM Sans` handles structural signposts, space headings, and floating panel crowns with geometric precision and open counters. `Inter` acts as the computational engine for data displays, layer hierarchies, numeric dimensions, and general interface text. Numerical values, CAD dimensions, and coordinate points always enforce tabular figures (`font-variant-numeric: tabular-nums`) to ensure strict visual verticality across property inspectors.

## Layout & Spacing
The layout model employs a docked-panel docking architecture anchored by an edge-to-edge spatial viewport.

- **Viewport Canvas**: Fluid center canvas supporting full pan/zoom canvas mechanics.
- **Docked & Floating Rails**: Fixed utility sidebars (280px left asset panel, 320px right inspector panel) on screens 1280px and wider.
- **Floating HUD Layers**: Central floating shelf overlays positioned 24px above viewport bottoms, horizontally centered.
- **Responsive Adaptations**:
  - *Desktop (≥1280px)*: Multi-column studio workflow with persistent pinned drawers, viewport center, and floating canvas tools.
  - *Tablet (768px - 1279px)*: Side inspectors collapse into overlay drawers invoked by persistent icon rails.
  - *Mobile (<768px)*: Full-bleed canvas with bottom sheet controls, single-column toolbars, and contextual floating action dials.

## Elevation & Depth
Depth conveys physical layering without dense, opaque drop shadows. The design system relies on architectural layering:

1. **Base Layer (Level 0)**: Canvas viewport and floorplan mesh grid (`#0F1115`).
2. **Structural Panels (Level 1)**: Sidebars, property inspectors, and breadcrumb headers (`#171A21`) bounded by hairline borders (`1px solid rgba(234, 230, 223, 0.08)`).
3. **Floating HUD & Toolbars (Level 2)**: Glassmorphic floating surfaces utilizing dark slate transparency (`rgba(23, 26, 33, 0.78)`), backdrop filters (`blur(16px) saturate(180%)`), fine brass-tinted borders (`1px solid rgba(212, 175, 55, 0.2)`), and ambient shadow rings (`0 12px 32px -4px rgba(0, 0, 0, 0.65)`).
4. **Modal Dialogs & Spatial Prompts (Level 3)**: Overlay surfaces (`#212631`) accompanied by dark scrim blurs (`rgba(15, 17, 21, 0.75)` with `backdrop-filter: blur(8px)`).

## Shapes
In line with precision architectural tools, shapes follow an engineered, crisp contour (`roundedness: 1`). 

- Standard inputs, buttons, chips, and tool cells utilize a subtle `0.25rem` (4px) corner radius.
- Floating HUD tool docks and contextual floating menus step up to `0.5rem` (8px).
- Generative prompt modals and spatial preview cards use `0.75rem` (12px).
- Strict circular forms (`border-radius: 9999px`) are reserved exclusively for spatial rotation handles, status beacons, and circular color/material swatch wells.

## Components

### Buttons
- **Primary Studio Action**: Solid brass fill (`#D4AF37`), dark slate text (`#0F1115`), font weight 600, 4px border radius. Hover transitions to champagne (`#E5C07B`) with a faint brass aura (`box-shadow: 0 0 16px rgba(212, 175, 55, 0.3)`).
- **Secondary / HUD Button**: Ghost surface with hairline border (`rgba(234, 230, 223, 0.12)`), text `#EAE6DF`. Hover shifts border to `rgba(212, 175, 55, 0.4)` and background to `rgba(255, 255, 255, 0.04)`.
- **Icon Tool Nodes**: 32x32px or 40x40px square cells. Active tool displays a recessed `#212631` fill and a vertical 2px `#D4AF37` indicator mark on the left perimeter.

### Floating Toolbars & HUD
- Horizontal modular strips suspended over the spatial viewport. Built with `rgba(23, 26, 33, 0.85)` backdrop blur, separated into tool clusters with vertical 1px divider rules (`rgba(234, 230, 223, 0.08)`).
- Tool groups support integrated keyboard shortcut tags (`KBD`) rendered in 10px uppercase tabular Inter.

### Input Fields & Spatial Controls
- **Coordinate & Dimension Inputs**: `#171A21` surface background with `1px solid rgba(234, 230, 223, 0.12)`. When focused, borders snap to `#D4AF37` with an ambient glow (`box-shadow: 0 0 0 1px #D4AF37`).
- **Scrubbable Numeric Labels**: Axis designations (X, Y, Z, Rotation, Scale) are rendered in tertiary `#8C887B` with interactive drag cursors.

### Chips & Badges
- Compact 20px height tokens. Composed of dark translucent fills (`rgba(212, 175, 55, 0.08)`), micro-borders (`1px solid rgba(212, 175, 55, 0.25)`), and warm brass typography for material states, LOD indicators, and AI model tags.

### Checkboxes & Radio Buttons
- 16x16px boxes with 2px corner radii. Unchecked states use a 1px border of `rgba(234, 230, 223, 0.2)`. Selected states trigger a solid `#D4AF37` fill with an architectural checkmark or central node rendered in `#0F1115`.

### Material & Scene Cards
- 1px hairline border containers enclosing 3D previews, asset thumbnails, or lighting presets. Hovering elevates border brightness and reveals a floating contextual action menu with a glassmorphic micro-shelf at the top right of the card.