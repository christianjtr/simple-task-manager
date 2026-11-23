# Simple Task Manager

A local-first Kanban task manager built with React, TypeScript, Vite, Ant Design, Tailwind CSS, and Dexie. Projects and tasks live in the browser (IndexedDB), so the app works without a backend, authentication, or a WebSocket connection.

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

- Create, rename, and delete projects; keep the active project in local storage.
- Create, edit, delete, filter, and search tasks by text, priority, and tag.
- Move and reorder tasks across **To Do**, **In Progress**, and **Done** with the mouse or keyboard.
- Persist all changes in IndexedDB using Dexie and `useLiveQuery`.
- Export and import all data through a versioned JSON backup.
- Keep the UI responsive, themeable (light/dark), and accessible.
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
- `src/features/tasks/task.repository.ts`: all persisted mutations, including backup import.
- `src/features/tasks/task.import-export.ts`: versioned backup export and parse/validate import.
- `src/features/tasks/task.schema.ts`: Zod schemas for domain and JSON shapes.
- `src/hooks/useProjects.ts` / `src/hooks/useTasks.ts`: reactive reads from IndexedDB.
- `src/hooks/useActiveProject.ts` / `src/hooks/useTheme.ts`: persisted UI preferences.
- `src/components/Header/Header.tsx`: project title, theme toggle, and data menu.
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

Use the **Datos** menu in the header to:

- **Exportar JSON**: download `{ version: 1, exportedAt, projects, tasks }`.
- **Importar JSON**: select a backup, validate it, persist it in a Dexie transaction, and review imported/skipped counts.

Import uses `bulkPut`, so an incoming ID replaces an existing local record with the same ID. Duplicate IDs inside a single backup are skipped with a console warning.

## Testing

The suite currently contains 29 tests across 9 files.

```shell
pnpm check
pnpm build
pnpm test
pnpm test:e2e
```

Unit/integration tests use `fake-indexeddb/auto` and jsdom polyfills from `src/setupTests.ts`. Playwright smoke tests live in `e2e/` and are excluded from Vitest.

## Modernization

The original implementation was a mock real-time Kanban demo backed by Redux and an in-browser fake WebSocket. It was modernized in eight reviewable stages, each developed in its own branch and merged locally into `main`.

| Stage | Branch                                   | Commit    | Outcome                                                |
| ----- | ---------------------------------------- | --------- | ------------------------------------------------------ |
| 1     | `modernization/01-toolchain`             | `5b82b74` | pnpm, Vitest, Biome, Playwright, Tailwind v4           |
| 2     | `modernization/02-domain-db`             | `98ec2d5` | Zod/Luxon domain, Dexie v1, repository, backup helpers |
| 3     | `modernization/03-remove-realtime-redux` | `ad0ca7b` | Removed Redux/mock realtime, added live-query hooks    |
| 4     | `modernization/04-shell-projects-theme`  | `69402a8` | Responsive shell, active project, theme, empty states  |
| 5     | `modernization/05-task-crud-filters`     | `2446b74` | Task CRUD and filters                                  |
| 6     | `modernization/06-dnd-order`             | `66be955` | dnd-kit columns, keyboard movement, persisted order    |
| 7     | `modernization/07-portability`           | `26be327` | JSON export/import UI and repository import            |
| 8     | `modernization/08-docs-demo-workflow`    | pending   | Documentation and GitHub Pages demo workflow           |

Notable decisions:

- No backend, auth, Redux, TanStack Query, or simulated WebSocket.
- Ant Design provides components/theming; Tailwind provides layout utilities; SASS remains for a few component styles.
- Drag-and-drop uses dnd-kit with `useDroppable` columns and `useSortable` cards.
- Ant Design Modal uses `destroyOnHidden` (not the older `destroyOnClose`).
- GitHub Pages builds use `DEMO_BASE=true` to set the Vite base path to `/simple-task-manager/`.

## Demo deployment

`.github/workflows/deploy-demo.yml` deploys the `demo` branch to GitHub Pages using the official Pages actions.

To publish a demo:

```shell
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
- Import replaces records with matching IDs via `bulkPut`.
- Task images from the original challenge are no longer used.
- The production build emits a Vite chunk-size warning because Ant Design is bundled into one chunk. It does not affect correctness.
- The Dribbble visual reference is guarded by a WAF, so implementation followed the challenge requirements and the existing design language instead.
