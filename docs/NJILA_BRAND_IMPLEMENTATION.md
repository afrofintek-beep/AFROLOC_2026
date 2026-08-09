# NJILA brand implementation specification

Source of truth: **NJILA Brand Identity Manual 2026 — Master Edition 1.0, August 2026**.

This document translates the approved manual into implementation constraints. It does not replace the manual or the final vector master assets.

## Brand role

NJILA is Africa's territorial mapping, routing and navigation platform. It transforms AFROLOC digital addresses, local landmarks, informal roads and community knowledge into reliable routes to places conventional maps may not recognise.

- Promise: **Every place can be reached.**
- Position: **African by origin. Continental by ambition. Global in usability.**
- Primary tagline: **The Way to Every Place.**
- Core explanation: **AFROLOC identifies the place. NJILA finds the way.**
- Endorsement: **Powered by AFROLOC.**

## Name and mark

The symbolic N and JILA form one cohesive wordmark. The symbolic N is the first letter, not a detachable decorative badge when the full name is required.

Symbol meaning:

- origin circle: person, vehicle, parcel or service begins the journey;
- continuous route line: movement through formal and informal territory;
- open destination diamond: identifiable and reachable destination.

Rules:

- use approved master vector artwork only;
- never typeset or reconstruct the custom wordmark;
- never trace from screenshots or the PDF;
- do not change route geometry, origin or destination diamond;
- do not repeat a conventional N after the symbolic N;
- do not stretch, compress, rotate, outline or add effects;
- do not place on visually noisy or low-contrast backgrounds;
- use the standalone N only after its dedicated vector icon is approved.

Clear space: at least 1X on all sides, where X is the origin-circle diameter.

Minimum sizes:

- full wordmark, print: 32 mm;
- full wordmark, screen: 160 px;
- standalone symbolic N: 24 px, only after icon approval.

## Colour tokens

The manual states these values are provisional until the final vector master is colour-certified.

```css
:root {
  --njila-territorial-green: #1F4037;
  --njila-route-gold: #C99D46;
  --njila-navigation-cream: #F7F4EC;
  --njila-deep-ink: #17231F;
  --njila-mist-green: #DDE6E1;
  --njila-sand-gold: #EFE5CF;
}
```

Recommended balance:

- 60% Navigation Cream: primary canvas and breathing room;
- 30% Territorial Green: typography, navigation and institutional surfaces;
- 10% Route Gold: routes, destinations, highlights and active states.

Accessibility:

- body text on light surfaces uses Deep Ink or Territorial Green;
- gold is not permitted for small body copy;
- never communicate status with colour alone;
- every status requires an icon, label or pattern;
- all interface combinations must meet WCAG 2.2 AA.

## Typography

- Brand/display: Sora or Manrope.
- Interface, directions, tables and long-form: Inter.
- System fallback: Arial.
- The production wordmark is custom art and must never be recreated with these fonts.

Hierarchy:

- display: 32–48 pt;
- heading: 20–28 pt;
- subheading: 14–18 pt;
- body: 10–12 pt;
- interface: minimum 14 px;
- caption: 8–10 pt.

For responsive web implementation, preserve these relationships while meeting accessibility and zoom requirements.

## Voice and directions

NJILA must sound:

- clear;
- reliable;
- local;
- inclusive;
- calm;
- respectful.

Directions should use recognised landmarks and community-validated names.

Preferred example:

> Pass Kikolo Market. Turn right after the church. Continue 300 metres along the unpaved road.

State route uncertainty, access restrictions and changing conditions. Never describe informal communities as blank, chaotic or invisible.

Supporting lines:

- Every place has a way.
- Mapping the unmapped.
- Local knowledge. Navigable routes.
- No street name. Still reachable.

## Map visual hierarchy

The map identity must be functional, not decorative.

- active route and destination: Route Gold;
- verified territorial layer: Territorial Green;
- neutral map canvas: light/white;
- secondary or community layer: Mist Green;
- hazard, closure or blocked access: accessible warning treatment with icon/label/pattern, not colour alone.

Brand expression must never reduce navigation clarity, safety, contrast, legibility or route-status precedence.

## Imagery and iconography

Prioritise:

- real pedestrians, riders, drivers, couriers and community validators;
- named and unnamed roads, paths, markets, rural access points and landmarks;
- route lines, directional sequences and community-validated mapping;
- authentic African contexts with consent and privacy by design.

Avoid:

- generic satellite imagery used only as decoration;
- poverty stereotypes or passive subjects;
- overuse of African patterns;
- fictional routes presented as verified;
- exposed private home coordinates.

Icons use rounded strokes and simple geometry derived from the symbolic route language. Do not place text inside icons. Maintain a coherent 24 px grid and stroke system.

## Applications

- App icon: symbolic N only, but only when the dedicated approved vector icon exists.
- Vehicles: primary mark on high-contrast panels; keep clear space around doors and safety markings.
- Signage: prioritise distance visibility and local-language instructions.
- Uniforms: one-colour embroidery where full-colour is limited.
- Documents: use the full wordmark; reserve gold for headings and directional cues.
- Partner use: keep “Powered by AFROLOC” secondary and never merge partner marks.

## Product architecture

NJILA has a distinct role in the AFROFINTEK ecosystem:

- Yamioo: discovery;
- AFROLOC: identity;
- NJILA: navigation;
- MAGUELA: mobility;
- IMBAMBA: delivery.

NJILA owns the route and navigation experience. AFROLOC owns address identity and access permissions. Interfaces must make this distinction clear while presenting a seamless user journey.

## Asset gate

Before production publication, obtain and approve:

- primary and reversed logos;
- single-colour variants;
- standalone symbolic N;
- SVG, PDF, EPS and PNG exports;
- app icons and favicons;
- colour and contrast test sheet.

Until these files exist, use a clearly labelled development placeholder. Do not reconstruct the mark programmatically or from the manual preview.

## Acceptance checklist

- approved vector asset used;
- full wordmark at least 160 px on screens;
- clear space respected;
- 60/30/10 colour hierarchy applied;
- gold not used for body text;
- Inter used for operational UI;
- Sora/Manrope used for display;
- WCAG 2.2 AA verified;
- route states include non-colour indicators;
- landmark-based guidance supported;
- “Powered by AFROLOC” remains secondary;
- no AFROLOC private coordinate exposed through NJILA;
- mobile, low-bandwidth, offline and local-language states reviewed.
