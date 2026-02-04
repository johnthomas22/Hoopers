# CLAUDE.md — Hoopers

## Project Overview

Hoopers is a suite of three mobile-first web apps for dog agility hoopers — a variant of agility that uses hoops, barrels, and tunnels instead of A-frames and dog walks, keeping dogs safer at ground level.

The project is a **monorepo** with three independent React applications:

| App | Path | Purpose | URL path |
|-----|------|---------|----------|
| **Ring Designer** | `/src` | Design hoopers competition rings — place obstacles, number them, save/load | `/Hoopers/` |
| **2D Simulator** | `/sim` | Load a course JSON and watch an animated dog + handler run it | `/Hoopers/sim/` |
| **3D Simulator** | `/sim3d` | Interactive 3D handler training — click-to-move handler, give signals at decision points | `/Hoopers/sim3d/` |

Each app has its own `package.json`, `vite.config.ts`, and TypeScript config. They share no code at the module level but duplicate common type definitions and equipment constants.

## Tech Stack

All three apps share:
- **Framework**: React 19 with TypeScript 5.9 (strict mode)
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- **State**: React hooks — no external state library

App-specific:
- **Ring Designer**: Konva + react-konva (HTML5 Canvas), vite-plugin-pwa (Workbox), uuid v13
- **2D Simulator**: Konva + react-konva (HTML5 Canvas)
- **3D Simulator**: Three.js 0.175 + @react-three/fiber 9 + @react-three/drei 10

## Commands

Each app is built independently. Run from the project root unless noted.

### Ring Designer (root)

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Type-check (tsc -b) then production build → dist/
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

### 2D Simulator

```bash
cd sim
npm run dev       # Dev server
npm run build     # Type-check + build → sim/dist/
```

### 3D Simulator

```bash
cd sim3d
npm run dev       # Dev server
npm run build     # Type-check + build → sim3d/dist/
```

All build commands run `tsc -b && vite build` — TypeScript type-checking must pass before bundling.

## Project Structure

```
├── index.html                        # Ring Designer app shell (PWA meta tags)
├── vite.config.ts                    # Ring Designer: Vite + React + Tailwind + PWA
├── tsconfig.json                     # Root TS config (references app + node)
├── tsconfig.app.json                 # App TS config (strict, ES2022, DOM)
├── tsconfig.node.json                # Node TS config (for vite.config.ts)
├── eslint.config.js                  # ESLint config
├── package.json                      # Ring Designer dependencies
├── public/                           # Static assets (PWA icons)
├── .github/workflows/deploy.yml      # CI/CD: builds all 3 apps, deploys to GitHub Pages
│
├── src/                              # ── RING DESIGNER ──
│   ├── main.tsx                      # Entry point
│   ├── index.css                     # Tailwind + global styles
│   ├── App.tsx                       # Root: assembles Toolbar, RingCanvas, Palette
│   ├── types/
│   │   └── course.ts                 # Equipment, Course, EquipmentType
│   ├── hooks/
│   │   └── useCourseDesigner.ts      # All state: course, selection, undo/redo, CRUD, persistence
│   ├── components/
│   │   ├── RingCanvas.tsx            # Konva Stage: ring, grid, equipment, run path, pan/zoom
│   │   ├── EquipmentShape.tsx        # Per-obstacle rendering with order badges
│   │   ├── EquipmentPalette.tsx      # Bottom bar: add equipment buttons
│   │   ├── Toolbar.tsx               # Top bar: name, save/open/new, settings, selection controls
│   │   └── CourseList.tsx            # Modal for loading/deleting saved courses
│   └── utils/
│       ├── equipment.ts              # Equipment defs, ring presets, SCALE constant
│       └── storage.ts                # localStorage CRUD for courses
│
├── sim/                              # ── 2D SIMULATOR ──
│   ├── package.json
│   ├── vite.config.ts                # base: '/Hoopers/sim/'
│   ├── index.html
│   └── src/
│       ├── App.tsx                   # FileLoader or SimCanvas + PlaybackBar
│       ├── main.tsx
│       ├── index.css
│       ├── types/
│       │   └── course.ts            # Same Equipment/Course types
│       ├── hooks/
│       │   └── useSimulation.ts      # Simulation state: path sampling, dog/handler positions, playback
│       ├── components/
│       │   ├── SimCanvas.tsx         # Konva Stage: grid, path, equipment, dog, handler
│       │   ├── PlaybackBar.tsx       # Play/pause/seek/speed controls + keyboard shortcuts
│       │   ├── FileLoader.tsx        # JSON file upload with validation
│       │   ├── DogSprite.tsx         # Orange circle + heading triangle
│       │   ├── HandlerSprite.tsx     # Blue circle + dashed line to dog
│       │   └── StaticEquipment.tsx   # Non-interactive obstacle rendering
│       └── utils/
│           ├── spline.ts            # Catmull-Rom cardinal spline implementation
│           ├── pathSampler.ts        # Arc-length parameterization for uniform-speed sampling
│           └── equipment.ts          # Same equipment defs
│
└── sim3d/                            # ── 3D HANDLER TRAINING SIMULATOR ──
    ├── package.json
    ├── vite.config.ts                # base: '/Hoopers/sim3d/'
    ├── index.html
    └── src/
        ├── App.tsx                   # FileLoader or SimulatorView
        ├── main.tsx
        ├── index.css
        ├── types/
        │   ├── course.ts            # Same Equipment/Course types
        │   └── simulation.ts         # Signal, DogBehaviorState, DecisionPoint, SimulationState
        ├── hooks/
        │   └── useSimulation3D.ts    # Full sim: spline path, decision points, dog AI, handler movement
        ├── components/
        │   ├── SimulatorView.tsx     # Orchestrator: 3D scene + HUD + signals + results overlay
        │   ├── Scene.tsx             # Canvas: lighting, sky, ground, obstacles, click handler
        │   ├── Dog3D.tsx             # Procedural 3D dog model with trotting animation
        │   ├── Handler3D.tsx         # Procedural 3D human model with arms
        │   ├── Ground.tsx            # Ground plane + ring area + click-to-move surface
        │   ├── FollowCamera.tsx      # Camera behind handler, looking toward dog
        │   ├── SimulationRunner.tsx   # Tick driver: calls simulation tick() each frame
        │   ├── RunPath3D.tsx         # 3D dashed pink path line
        │   ├── FileLoader.tsx        # Drag-drop + click file input
        │   ├── Obstacle3D.tsx        # Router dispatching to specific obstacle types
        │   ├── obstacles/
        │   │   ├── Hoop3D.tsx        # Blue elliptical arch (TubeGeometry)
        │   │   ├── Barrel3D.tsx      # Cylinder with torus rings
        │   │   ├── Tunnel3D.tsx      # Semi-transparent green cylinder
        │   │   ├── StartMarker3D.tsx  # Green circle + cone arrow + "START" label
        │   │   └── FinishMarker3D.tsx # Red square + "FINISH" label
        │   └── ui/
        │       ├── SignalPanel.tsx    # Mobile touch buttons for signals
        │       ├── HUD.tsx           # Time, faults, dog state, next obstacle, expected signal
        │       └── ResultsOverlay.tsx # End-of-run results with retry button
        └── utils/
            ├── spline.ts            # Catmull-Rom spline
            ├── pathSampler.ts        # Arc-length utilities
            ├── coordinateTransform.ts # 2D pixel coords → 3D world meters
            ├── courseLoader.ts        # parseCourseFile() with validation
            └── equipment.ts          # Same equipment defs
```

## Architecture & Key Patterns

### Shared Concepts

**Equipment types** — defined identically across all three apps as the `EquipmentType` union in `types/course.ts`:

| Type     | Visual          | Purpose                          |
|----------|-----------------|----------------------------------|
| `hoop`   | Blue arc        | Primary hoopers obstacle         |
| `barrel` | Amber circle    | Send-away / directional target   |
| `tunnel` | Green rounded rect | Tunnel obstacle               |
| `start`  | Green arrow     | Course start marker              |
| `finish` | Red square      | Course finish marker             |

Each placed equipment has: `id`, `type`, `x`, `y`, `rotation`, and `orderNumber` (null for start/finish markers).

**Ring presets** — three standard sizes in `utils/equipment.ts`:
- Small: 20m x 30m
- Medium: 25m x 35m (default)
- Large: 30m x 40m

**Run path** — a dashed pink line connecting obstacles in order: Start -> numbered obstacles (sorted by `orderNumber`) -> Finish.

**Coordinate system** — the Ring Designer and 2D Simulator use `SCALE = 20` (1 meter = 20 pixels). The 3D Simulator converts from pixel coordinates to world-space meters via `coordinateTransform.ts`.

**Course file format** — courses are serialized as JSON with equipment arrays, ring dimensions, and metadata. The 2D and 3D simulators load course JSON files exported from the Ring Designer.

### Ring Designer (`src/`)

All course state lives in the `useCourseDesigner` hook:
- Active `Course` object (ring dimensions, equipment list)
- Selection state (`selectedId`)
- Undo/redo history (50 levels max, keyboard shortcuts: Ctrl+Z / Ctrl+Y)
- CRUD operations for equipment (add, update, remove, rotate, renumber)
- Course persistence (save, load, delete, new, export/import JSON)
- UI state (course list modal, settings panel)

Components receive state and callbacks via props from `App.tsx` — no context providers.

Canvas rendering uses Konva (react-konva) on HTML5 Canvas:
- `RingCanvas.tsx` — Stage with pan/zoom (wheel + drag + pinch-to-zoom), grid with meter labels
- `EquipmentShape.tsx` — each obstacle type with distinct visuals, order number badges, selection indicators
- Equipment is draggable via Konva's `draggable` prop

Persistence: courses stored as JSON in `localStorage` under key `hoopers-courses`.

### 2D Simulator (`sim/`)

Loads a course JSON and animates a dog running through the obstacles with a handler following alongside.

Key concepts:
- **Catmull-Rom spline** (`utils/spline.ts`) — smooth path through ordered waypoints
- **Arc-length parameterization** (`utils/pathSampler.ts`) — sample positions along the spline by distance (not parameter) for consistent speed
- **Handler offset** — handler position is computed perpendicular to the dog's path with exponential smoothing and ring boundary clamping
- **Playback controls** — play/pause, step forward, speed (0.5x/1x/1.5x/2x), timeline seek. Keyboard: Space = play/pause, Left/Right arrows = step/speed

### 3D Simulator (`sim3d/`)

Interactive handler training simulator. The handler is controlled by the user; the dog runs autonomously and expects signals at decision points.

**Signal system** — five signals the handler can give:
- `left`, `right` — directional signals at turns
- `go_on` — continue straight ahead
- `wait` — hold position
- `go` — release to start/resume

Signals are given via keyboard (arrow keys, Space) or mobile touch buttons (`SignalPanel.tsx`).

**Decision points** — automatically detected at each obstacle transition by analyzing turn angles (cross product determines left/right/straight). Each has:
- A correct signal type
- A signal window (~4m before obstacle to ~1m before)
- Fault counted if wrong or no signal given in the window

**Dog behavior states** (`DogBehaviorState`):
- `idle` — waiting to start
- `approaching` — heading toward next obstacle
- `committed` — signal received, executing
- `hesitating` — in decision window, no signal yet (slows down)
- `waiting` — stopped, waiting for signal
- `taking_wrong` — wrong signal given, fault counted
- `recovering` — returning to correct path after fault

**Handler movement** — click/tap on the ground plane sets a target position; handler walks toward it at 2 m/s. The follow camera stays behind the handler looking toward the dog.

**3D rendering** uses React Three Fiber (declarative Three.js):
- Procedural geometry for dog and handler (no external 3D models)
- Smooth position/rotation interpolation with `lerp`
- Follow camera with 3-second smoothing
- Obstacle models built from Three.js primitives (TubeGeometry, CylinderGeometry, etc.)

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) deploys to GitHub Pages on push to `main`/`master`:

1. `npm ci && npm run build` — Ring Designer → `dist/`
2. `cd sim && npm ci && npm run build` — 2D Simulator → `dist/sim/`
3. `cd sim3d && npm ci && npm run build` — 3D Simulator → `dist/sim3d/`
4. Upload `dist/` to GitHub Pages

All three apps are served from subpaths under the same GitHub Pages site. Each Vite config sets the appropriate `base` path.

## TypeScript Configuration

- **Strict mode** enabled with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- **Target**: ES2022 with DOM libs
- **Module**: ESNext with bundler resolution
- **`verbatimModuleSyntax`**: enabled — use `import type` for type-only imports

## Styling Conventions

- Tailwind CSS v4 utility classes (no `tailwind.config.js` — uses the Vite plugin)
- Dark theme using Slate color palette (slate-700/800/900)
- Mobile-first: `h-dvh` for full viewport, touch-friendly tap targets
- Custom `.btn-toolbar` class defined in `index.css` with `@apply`
- No CSS modules or styled-components

## PWA Configuration (Ring Designer only)

- Auto-update registration via `vite-plugin-pwa`
- Workbox service worker for offline caching
- Standalone display mode for native app feel
- PWA manifest configured in `vite.config.ts` (not a separate file)
- Icons: `icon-192.png` and `icon-512.png` in `public/`

## Development Guidelines

1. **Type safety**: All components use explicit TypeScript interfaces for props. Use `import type` for type-only imports.
2. **Component pattern**: Functional components with hooks. No class components.
3. **State updates**: Use functional updates (`setState(prev => ...)`) for state that depends on previous values.
4. **Konva events** (Ring Designer, 2D Sim): Use `Konva.KonvaEventObject<T>` for event handler types. For handlers shared between click and tap, use union type `MouseEvent | TouchEvent`.
5. **Three.js events** (3D Sim): Use `ThreeEvent` types from @react-three/fiber. Use `useFrame` for per-frame updates.
6. **Equipment IDs**: Generated with `uuid v4` — never use array indices as keys for equipment.
7. **No external state libraries**: Keep state in custom hooks (`useCourseDesigner`, `useSimulation`, `useSimulation3D`). Only add Redux/Zustand if complexity warrants it.
8. **Mobile first**: Test touch interactions (drag, tap, pinch-zoom) as primary input method. The 3D sim has dedicated mobile touch buttons for signals.
9. **Coordinate systems**: The Ring Designer and 2D Sim use pixel coordinates (SCALE = 20 px/m). The 3D Sim works in meters and converts via `coordinateTransform.ts`.
10. **No shared packages**: Each app is self-contained with its own `node_modules`. Common types and utils are duplicated, not symlinked.

## Common Tasks

### Adding a new equipment type

Must be added to all three apps:

**Ring Designer (`src/`)**:
1. Add the type to the `EquipmentType` union in `src/types/course.ts`
2. Add its definition (color, dimensions, label) in `src/utils/equipment.ts`
3. Add rendering logic as a new `case` in `EquipmentShape.tsx`'s `renderShape()` switch
4. Add it to `PALETTE_ITEMS` array in `EquipmentPalette.tsx`

**2D Simulator (`sim/`)**:
1. Add the type to `sim/src/types/course.ts`
2. Add its definition in `sim/src/utils/equipment.ts`
3. Add rendering in `sim/src/components/StaticEquipment.tsx`

**3D Simulator (`sim3d/`)**:
1. Add the type to `sim3d/src/types/course.ts`
2. Add its definition in `sim3d/src/utils/equipment.ts`
3. Create a new `sim3d/src/components/obstacles/<Type>3D.tsx` component
4. Add the case to `sim3d/src/components/Obstacle3D.tsx`

### Changing ring dimensions

Ring presets are in `RING_PRESETS` in each app's `utils/equipment.ts`. The `SCALE` constant controls pixels-per-meter (default 20) in the 2D apps.

### Modifying the run path

- **Ring Designer**: In `RingCanvas.tsx` — look for `numbered` and `fullPathPoints` variables
- **2D Simulator**: In `sim/src/hooks/useSimulation.ts` — spline is built from ordered waypoints
- **3D Simulator**: In `sim3d/src/hooks/useSimulation3D.ts` — spline path and decision points are computed from ordered obstacles

### Modifying the 3D simulation model

The simulation logic is entirely in `sim3d/src/hooks/useSimulation3D.ts`:
- **Dog speed/behavior**: modify constants at the top of the hook
- **Decision point detection**: look for the cross-product angle analysis that determines left/right/straight
- **Signal windows**: adjust the distance thresholds (~4m open, ~1m close)
- **Handler speed**: `HANDLER_SPEED` constant (default 2 m/s)
