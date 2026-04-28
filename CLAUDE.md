# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `npm run dev` — starts Vite at `http://0.0.0.0:8081`
- **Build**: `npm run build` — runs `tsc -b` then `vite build`
- **Preview**: `npm run preview` — serves built output at `http://0.0.0.0:8081`
- **Type-check**: `npx tsc -b --noEmit` (or drop `--noEmit` to also emit)
- **No tests or linter** configured in this project

## Architecture

This is a **thesis presentation system** for computer vision research — a React 18 SPA with Vite 5 and TypeScript. No routing library, no state management library, no CSS framework, no testing framework. All data is hardcoded in TypeScript files; there is no backend.

### Pages

- **Page 1** (`src/components/page1/Page1Demo.tsx`): Foreground segmentation model demo. Supports 4 task types (SOD/COD/ORSI-SOD/DBD) with sample selection, image upload, and a simulated 800ms inference timer. Displays input, predicted mask, and overlay in a grid.
- **Page 2** (`src/components/page2/Page2Demo.tsx`): Training data quality evaluation. Pre-computed scores across three dimensions (IQA 0-1, Task Representativeness 1-5, Training Suitability 1-5) with structured explanation panels. Simulated 650ms evaluation.

### Navigation

Page switching uses `?page=page1|page2` URL parameter via `history.replaceState` (no router library). Handled in `App.tsx`.

### Shared Components (`src/components/shared/`)

- `PageSwitcher.tsx` — tab navigation
- `SampleSelector.tsx` — button list for demo samples
- `TaskPills.tsx` — clickable task-type pills
- `GalleryCard.tsx` + `ImagePreviewModal.tsx` — image gallery with modal
- `MediaPreview.tsx` — renders single or layered images (mask overlay uses `mix-blend-mode: screen` + `opacity: 0.52`)

### Data Flow

- Hardcoded samples in `src/data/page1DemoData.ts` and `src/data/page2DemoData.ts`
- Types defined in `src/types.ts`
- No API calls or external data fetching

### Styling

Plain CSS files in `src/styles/`, imported via `index.css` (which uses `@import`). CSS custom properties in `base.css`. Responsive breakpoints at 1180px and 780px. No CSS modules, preprocessors, or CSS-in-JS.

### Key Files

| File | Purpose |
|---|---|
| `src/App.tsx` | Root component, page routing, preview modal |
| `src/types.ts` | All TypeScript types (DemoSample, EvalSample, TaskType, etc.) |
| `src/hooks/useObjectUrl.ts` | Hook for `URL.createObjectURL` lifecycle |
| `vite.config.ts` | Vite config (React plugin only) |
| `tsconfig.json` | TypeScript config (strict mode, ES2020, DOM libs) |
