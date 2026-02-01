# CLAUDE.md — Hoopers Ring Designer

## Project Overview

Hoopers Ring Designer is a mobile-first Progressive Web App (PWA) for designing dog agility hoopers competition rings. Hoopers is a variant of dog agility that uses hoops, barrels, and tunnels instead of A-frames and dog walks, keeping dogs safer at ground level. This app lets judges and course designers lay out obstacles on a virtual ring, number them for run order, and save/load designs.

## Tech Stack

- **Framework**: React 19 with TypeScript (strict mode)
- **Build Tool**: Vite 7
- **Canvas**: Konva + react-konva (HTML5 Canvas for the ring designer)
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- **PWA**: vite-plugin-pwa with Workbox for offline support and mobile install
- **State**: React hooks (`useState`, `useCallback`) — no external state library
- **Storage**: Browser localStorage for course persistence
- **IDs**: uuid v13

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Type-check (tsc -b) then production build
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

The build command runs `tsc -b && vite build` — TypeScript type-checking must pass before bundling.

## Project Structure

```
├── index.html                  # App shell with PWA meta tags
├── vite.config.ts              # Vite + React + Tailwind + PWA plugins
├── tsconfig.json               # Root TS config (references app + node)
├── tsconfig.app.json           # App TS config (strict, ES2022, DOM)
├── tsconfig.node.json          # Node TS config (for vite.config.ts)
├── package.json
├── public/                     # Static assets (PWA icons go here)
│   └── vite.svg
└── src/
    ├── main.tsx                # Entry point — renders <App />
    ├── index.css               # Tailwind import + global styles
    ├── App.tsx                 # Root component — assembles Toolbar, RingCanvas, Palette
    ├── types/
    │   └── course.ts           # Type definitions: Equipment, Course, EquipmentType
    ├── hooks/
    │   └── useCourseDesigner.ts # Main state management hook
    ├── components/
    │   ├── RingCanvas.tsx      # Konva Stage — ring background, grid, equipment, run path
    │   ├── EquipmentShape.tsx  # Individual obstacle rendering (hoop, barrel, tunnel, start, finish)
    │   ├── EquipmentPalette.tsx # Bottom bar — buttons to add equipment
    │   ├── Toolbar.tsx         # Top bar — name, save/open/new, settings, selection controls
    │   └── CourseList.tsx      # Modal for loading/deleting saved courses
    └── utils/
        ├── equipment.ts        # Equipment definitions, ring presets, SCALE constant
        └── storage.ts          # localStorage CRUD for courses
```

## Architecture & Key Patterns

### State Management

All course state lives in `useCourseDesigner` hook (`src/hooks/useCourseDesigner.ts`). This single hook manages:

- The active `Course` object (ring dimensions, equipment list)
- Selection state (`selectedId`)
- CRUD operations for equipment (add, update, remove, rotate)
- Course persistence (save, load, delete, new)
- UI state (course list modal visibility)

Components receive state and callbacks via props from `App.tsx` — no context providers or global stores.

### Canvas Rendering

The ring is rendered using Konva (react-konva) on an HTML5 Canvas:

- `RingCanvas.tsx` — owns the `<Stage>`, handles pan/zoom (wheel + drag), renders grid, run path, and equipment
- `EquipmentShape.tsx` — renders each obstacle type with distinct visuals, order number badges, and selection indicators
- Equipment is draggable natively via Konva's `draggable` prop

The coordinate system uses `SCALE = 20` (1 meter = 20 pixels). Ring dimensions are stored in meters and multiplied by SCALE for rendering.

### Equipment Types

Defined in `src/types/course.ts` as the `EquipmentType` union:

| Type     | Visual   | Purpose                    |
|----------|----------|----------------------------|
| `hoop`   | Blue arc | Primary hoopers obstacle   |
| `barrel` | Amber circle | Send-away / directional target |
| `tunnel` | Green rounded rect | Tunnel obstacle      |
| `start`  | Green arrow | Course start marker    |
| `finish` | Red square | Course finish marker    |

Each placed equipment has: `id`, `type`, `x`, `y`, `rotation`, and `orderNumber` (null for start/finish markers).

### Ring Presets

Three standard sizes in `src/utils/equipment.ts`:
- Small: 20m × 30m
- Medium: 25m × 35m (default)
- Large: 30m × 40m

### Run Path Visualization

A dashed pink line connects obstacles in order: Start → numbered obstacles (sorted by `orderNumber`) → Finish. This shows the dog's intended path through the course.

### Persistence

Courses are serialized as JSON to `localStorage` under the key `hoopers-courses`. The `src/utils/storage.ts` module provides `loadCourses`, `saveCourse`, `saveCourses`, and `deleteCourse` functions.

## TypeScript Configuration

- **Strict mode** enabled with `noUnusedLocals`, `noUnusedParameters`
- **Target**: ES2022 with DOM libs
- **Module**: ESNext with bundler resolution
- **`verbatimModuleSyntax`**: enabled — use `import type` for type-only imports

## Styling Conventions

- Tailwind CSS v4 utility classes (no `tailwind.config.js` — uses the Vite plugin)
- Dark theme using Slate color palette (slate-700/800/900)
- Mobile-first: `h-dvh` for full viewport, touch-friendly tap targets
- Custom `.btn-toolbar` class defined in `index.css` with `@apply`
- No CSS modules or styled-components

## PWA Configuration

- Auto-update registration via `vite-plugin-pwa`
- Workbox service worker for offline caching
- Standalone display mode for native app feel
- PWA manifest in `vite.config.ts` (not a separate file)
- Add `icon-192.png` and `icon-512.png` to `public/` for app icons

## Development Guidelines

1. **Type safety**: All components use explicit TypeScript interfaces for props. Use `import type` for type-only imports.
2. **Component pattern**: Functional components with hooks. No class components.
3. **State updates**: Use functional updates (`setState(prev => ...)`) for state that depends on previous values.
4. **Konva events**: Use `Konva.KonvaEventObject<T>` for event handler types. For handlers shared between click and tap, use union type `MouseEvent | TouchEvent`.
5. **Equipment IDs**: Generated with `uuid v4` — never use array indices as keys for equipment.
6. **No external state libraries**: Keep state in the `useCourseDesigner` hook. Only add Redux/Zustand if complexity warrants it.
7. **Mobile first**: Test touch interactions (drag, tap, pinch-zoom) as primary input method.

## Common Tasks

### Adding a new equipment type

1. Add the type to the `EquipmentType` union in `src/types/course.ts`
2. Add its definition (color, dimensions, label) in `src/utils/equipment.ts`
3. Add rendering logic as a new `case` in `EquipmentShape.tsx`'s `renderShape()` switch
4. Add it to `PALETTE_ITEMS` array in `EquipmentPalette.tsx`

### Changing ring dimensions

Ring presets are in `RING_PRESETS` in `src/utils/equipment.ts`. The `SCALE` constant controls pixels-per-meter (default 20).

### Modifying the run path

Run path logic is in `RingCanvas.tsx` — look for the `numbered` and `fullPathPoints` variables near the end of the component.
