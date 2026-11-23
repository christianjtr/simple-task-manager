# Tasklane

Tasklane is a local-first Kanban task manager built with React, TypeScript, Vite, Ant Design, Tailwind CSS, and Dexie. Projects and tasks live in the browser (IndexedDB), so the app works without a backend, authentication, or a WebSocket connection. The repository and Dexie database keep their original `simple-task-manager` identifiers for data compatibility.

## Contents

1. [Goals](#goals)
2. [Tech stack](#tech-stack)
3. [Installation and running](#installation-and-running)
4. [Architecture](#architecture)
5. [Data model and portability](#data-model-and-portability)
6. [Testing](#testing)
7. [Modernization](#modernization)
8. [Demo deployment](#demo-deployment)
9. [Assumptions and limitations](#assumptions-and-limitations)

## Goals

- Create, edit (name, description, color), and delete projects from the sidebar; keep the active project in local storage.
- Create, edit, delete, filter, and search tasks by text, priority, and tag.
- Move and reorder tasks across **To Do**, **In Progress**, and **Done** with the mouse or keyboard.
- Persist all changes in IndexedDB using Dexie and `useLiveQuery`.
- Export and import all data through a versioned JSON backup, with a hard limit of 50 projects.
- Keep the UI responsive, themeable (light/dark), accessible, and fully English.
- Explain storage limits and the JSON backup contract from the in-app Help drawer.
- Replace the original mock API/WebSocket/Redux implementation with a smaller local-first architecture.

## Tech stack

- **Framework:** React 18 and TypeScript
- **Build:** Vite 6
- **State/data:** Dexie, `dexie-react-hooks`, React hooks
- **UI:** Ant Design 5, Ant Design icons, Tailwind CSS v4, SASS modules
- **Drag and drop:** dnd-kit
- **Validation/dates:** Zod, Luxon
- **Testing:** Vitest, Testing Library, jest-dom, fake-indexeddb, Playwright
- **Tooling:** pnpm, Biome, TypeScript project references

## Installation and running

Requirements:

- Node.js 20 or newer
- pnpm 12.9.1 (declared in `package.json`)

```shell
git clone https://github.com/christianjtr/simple-task-manager.git
cd simple-task-manager
pnpm install
```

Scripts:

```shell
pnpm dev         # start Vite in development mode
pnpm build       # type check with tsc -b and build for production
pnpm preview     # preview the production build
pnpm check       # Biome format and lint check
pnpm check:fix   # Biome format and lint with fixes
pnpm lint        # Biome lint only
pnpm test        # run the Vitest suite once
pnpm test:watch  # run Vitest in watch mode
pnpm test:e2e    # run the Playwright smoke test
```

## Architecture

The data flow is intentionally small and unidirectional:

```text
Dexie tables (projects, tasks)
        -> useLiveQuery hooks
        -> useProjects / useTasks / useActiveProject / useTheme
        -> App shell and feature components
        -> task.repository.ts mutations
        -> Dexie tables
```

Key pieces:

- `src/db/database.ts`: Dexie database definition (version 1).
- `src/db/migrations.ts`: schema upgrades.
- `src/db/seed.ts`: optional example project and tasks.
- `src/features/tasks/task.repository.ts`: all persisted mutations, including the 50-project cap and backup import.
- `src/features/tasks/task.import-export.ts`: versioned backup export and parse/validate import.
- `src/features/tasks/task.schema.ts`: Zod schemas for domain and JSON shapes.
- `src/i18n/en.ts`: single English dictionary and typed translation helper.
- `src/styles/tailwind.css` / `src/styles/themes/default.ts`: semantic light/dark theme tokens.
- `src/hooks/useProjects.ts` / `src/hooks/useTasks.ts`: reactive reads from IndexedDB.
- `src/hooks/useActiveProject.ts` / `src/hooks/useTheme.ts`: persisted UI preferences.
- `src/components/Header/Header.tsx`: project title, theme toggle, and the ordered Help/Data/Theme icon actions.
- `src/components/HelpDrawer/HelpDrawer.tsx`: storage limits, JSON contract, and import behavior.
- `src/components/Sidebar/Sidebar.tsx`: project navigation, `N / 50` counter, 3-point Edit/Delete menu, and creation limit UI.
- `src/components/BackupActions/BackupActions.tsx`: JSON export/import UI.
- `src/components/TaskBoard/TaskBoard.tsx`: filters, CRUD actions, and dnd-kit context.
- `src/components/TaskBoard/components/TaskBoardStage/TaskBoardStage.tsx`: droppable columns.
- `src/components/TaskBoard/components/TaskCard/TaskCard.tsx`: sortable cards and keyboard handle.

Domain values use `Date` objects. At the JSON boundary they are serialized as ISO strings and validated with Zod. `useLiveQuery` returns `undefined` during the first load, so hooks normalize reads to empty arrays.

## Data model and portability

Dexie stores two tables:

```text
Project { id, name, description?, createdAt, updatedAt }
Task { id, projectId, title, description?, status, priority, tags[], dueDate?, position, createdAt, updatedAt }
```

Use the **Data** menu in the header to:

- **Export JSON**: download `{ version: 1, exportedAt, projects, tasks }`.
- **Import JSON**: select a backup, validate it, persist it in a Dexie transaction, and review imported/skipped counts.

Import uses `bulkPut`, so an incoming ID replaces an existing local record with the same ID. Duplicate IDs inside a single backup are skipped with a console warning. Both creation and import are rejected if the result would exceed 50 projects; no partial write is performed. The Help drawer documents this contract and the IndexedDB limitations in the app itself.

## Testing

The suite currently contains 40 tests across 13 files.

```shell
pnpm check
pnpm build
pnpm test
pnpm test:e2e
DEMO_BASE=true pnpm build
```

Unit/integration tests use `fake-indexeddb/auto` and jsdom polyfills from `src/setupTests.ts`. Playwright smoke tests live in `e2e/` and are excluded from Vitest.

## Modernization

The original implementation was a mock real-time Kanban demo backed by Redux and an in-browser fake WebSocket. It was modernized in eight reviewable stages and then refined in ten more, each developed in its own branch and merged locally into `main`.

| Stage | Branch                                   | Commit    | Outcome                                                |
| ----- | ---------------------------------------- | --------- | ------------------------------------------------------ |
| 1     | `modernization/01-toolchain`             | `5b82b74` | pnpm, Vitest, Biome, Playwright, Tailwind v4           |
| 2     | `modernization/02-domain-db`             | `98ec2d5` | Zod/Luxon domain, Dexie v1, repository, backup helpers |
| 3     | `modernization/03-remove-realtime-redux` | `ad0ca7b` | Removed Redux/mock realtime, added live-query hooks    |
| 4     | `modernization/04-shell-projects-theme`  | `69402a8` | Responsive shell, active project, theme, empty states  |
| 5     | `modernization/05-task-crud-filters`     | `2446b74` | Task CRUD and filters                                  |
| 6     | `modernization/06-dnd-order`             | `66be955` | dnd-kit columns, keyboard movement, persisted order    |
| 7     | `modernization/07-portability`           | `26be327` | JSON export/import UI and repository import            |
| 8     | `modernization/08-docs-demo-workflow`    | `65c0737` | Documentation and GitHub Pages demo workflow           |

Refinements continued in dedicated branches:

| Stage | Branch                                  | Commit    | Outcome                                                   |
| ----- | --------------------------------------- | --------- | --------------------------------------------------------- |
| 9     | `refinement/09-english-identity-header` | `dd8bcef` | English UI/seed, Tasklane identity, header avatar removed |
| 10    | `refinement/10-full-height-counters`    | `147696a` | Full-height layout, mobile board scroll, column counters  |
| 11    | `refinement/11-theme-tokens`            | `5b3af91` | Semantic light/dark tokens across CSS and Ant Design      |
| 12    | `refinement/12-help-backup-contract`    | `2806d3d` | Help drawer with storage and JSON backup documentation    |
| 13    | `refinement/13-project-limit`           | `ce0e195` | 50-project cap, sidebar counter, disabled creation        |
| 14    | `refinement/14-docs-final-qa`           | `19593c4` | Final documentation and verification gate                 |

| Stage | Branch                           | Commit    | Outcome                                                   |
| ----- | -------------------------------- | --------- | --------------------------------------------------------- |
| 15    | `refinement/15-project-actions`  | `55e1218` | 3-point project menu, project editing, and delete confirm |
| 16    | `refinement/16-header-actions`   | `5bf40a4` | Light header surface, ordered icon actions, `Sun` toggle  |
| 17    | `refinement/17-accent-and-brand` | `f6b64a2` | Shared dark purple palette and token-only accent classes  |
| 18    | `refinement/18-final-qa-docs`    | current   | Updated documentation and full verification gate          |

Notable decisions:

- No backend, auth, Redux, TanStack Query, or simulated WebSocket.
- Ant Design provides components/theming; Tailwind provides layout utilities; SASS remains for a few component styles.
- Drag-and-drop uses dnd-kit with `useDroppable` columns and `useSortable` cards.
- Project actions live in a 3-point menu; editing reuses the create modal and updates color too.
- The shared accent palette is `#6366f1` in light mode, `#818cf8` for dark hover/strong text, and `rgba(99,102,241,0.22)` for soft surfaces.
- Ant Design Modal and Drawer use `destroyOnHidden` (not the older `destroyOnClose`).
- The sidebar collapse state is intentionally session-only; it is not persisted.
- GitHub Pages builds use `DEMO_BASE=true` to set the Vite base path to `/simple-task-manager/`.

## Demo deployment

`.github/workflows/deploy-demo.yml` deploys the `demo` branch to GitHub Pages using the official Pages actions.

`main` is the source of truth; `demo` mirrors it for publishing. To publish a demo:

```shell
git switch main
git push origin main
git switch demo
git merge main
git push origin demo
```

The workflow installs with `pnpm install --frozen-lockfile`, builds with `DEMO_BASE=true`, uploads `dist`, and deploys to `https://christianjtr.github.io/simple-task-manager/`.

The workflow requires these repository settings:

- **Settings → Pages → Build and deployment → Source:** GitHub Actions
- Actions permissions allowing `contents: read`, `pages: write`, and `id-token: write` (declared in the workflow)

## Assumptions and limitations

- Data is local to the current browser profile; clearing site data removes it.
- There is no multi-device sync, collaboration, backend, or authentication.
- Import replaces records with matching IDs via `bulkPut` and refuses backups that would exceed 50 projects.
- A workspace supports at most 50 projects; the sidebar shows the current usage and disables creation at the cap.
- Sidebar collapse state is not persisted across reloads.
- Task images from the original challenge are no longer used.
- The production build emits a Vite chunk-size warning because Ant Design is bundled into one chunk. It does not affect correctness.
- The Dribbble visual reference is guarded by a WAF, so implementation followed the challenge requirements and the existing design language instead.
