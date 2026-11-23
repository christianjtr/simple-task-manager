# Simple Task Manager

A real-time Kanban task manager built with React, TypeScript, Redux Toolkit, Ant Design and SASS. The app loads 75 mock tasks, synchronizes task changes through a simulated WebSocket, and supports accessible drag-and-drop and keyboard task movement.

## Contents

1. [Goals](#goals)
2. [Tech stack](#tech-stack)
3. [Installation and running](#installation-and-running)
4. [Architecture](#architecture)
5. [Assumptions and limitations](#assumptions-and-limitations)
6. [Testing](#testing)
7. [Samples](#samples)

## Goals

The implementation covers the core challenge requirements:

- Real-time task synchronization through a provided mock WebSocket service.
- A three-column board: **To Do**, **In Progress**, and **Done**.
- Drag-and-drop reordering and movement between columns, plus keyboard controls.
- Task images rendered through a cached, fallback-aware `OptimizedImage` component.
- 75 pre-populated tasks loaded from a mock API.
- Graceful handling of API failures, WebSocket disconnections, and reconnection.
- Unit tests, one integration test, and a production build with type checking.

## Tech stack

- **Framework:** React 18 and TypeScript
- **Build:** Vite 6
- **State:** Redux Toolkit and React Redux
- **UI:** Ant Design 5, Ant Design icons, SASS modules
- **Testing:** Jest, ts-jest, Testing Library, jest-dom
- **Tooling:** ESLint flat config, TypeScript project references

## Installation and running

Requirements:

- Node.js 18 or newer
- npm

```shell
git clone https://github.com/christianjtr/simple-task-manager.git
cd simple-task-manager
npm install
```

Scripts:

```shell
npm run dev        # start Vite in development mode
npm run build      # type check with tsc -b and build for production
npm run preview    # preview the production build
npm run lint       # lint with zero warnings allowed
npm test           # run the Jest suite once
npm run test:watch # run Jest in watch mode
```

## Architecture

The data flow is deliberately layered so services, state, and UI stay decoupled:

```text
mockApi / mockWebSocket
        -> taskEvents (typed event bus)
        -> useTaskService (orchestration + validation)
        -> taskSlice (Redux state)
        -> TaskBoard / TaskBoardStage / TaskCard (UI)
```

Key pieces:

- `src/services/mockApi.ts`: in-memory task API. Supports fetch, create, update, delete, reorder, transient error retries, and deterministic task data.
- `src/services/mockWebSocket.ts`: simulated connection lifecycle with `connect`, `subscribe`, `send`, `simulateDisconnect`, `reconnect`, and connection-status subscriptions.
- `src/services/taskEvents.ts`: typed bus that prevents a circular dependency between the mock API and mock WebSocket.
- `src/hooks/useTaskService.ts`: validates incoming messages, dispatches Redux actions, handles reconnection, and performs optimistic moves with rollback.
- `src/store/taskSlice.ts`: owns tasks, loading state, error state, connection status, and ordering actions.
- `src/components/TaskBoard`: renders three always-present stages, Ant Design feedback, and retry UI.
- `src/components/OptimizedImage`: caches optimized image data URLs, uses async decoding, preserves dimensions, and falls back safely on failure.

Task data is validated at the service boundary with `isTask`, `isTaskUpdate`, and `isTaskOrderPayload` in `src/types/task.ts`.

## Assumptions and limitations

- The mock API and mock WebSocket are in-memory only. Refreshing the page restores the initial 75-task data set.
- No backend is required or configured. Real-time updates are simulated inside the browser.
- Connection status is displayed in the header as `Live`, `Connecting`, `Reconnecting`, or `Offline`.
- Drag-and-drop uses native HTML5 DnD plus keyboard controls. No third-party DnD library is used.
- The stretch goals for filtering and inline editing are not implemented.
- There is no offline queue; updates made while disconnected are rejected with user feedback.
- The production build emits a Vite chunk-size warning because Ant Design and Redux are bundled together. It does not affect correctness.

## Testing

The suite contains 30 tests across 7 suites, including a real-time integration test that verifies API-to-WebSocket-to-store-to-UI propagation.

```shell
npm test
npm run lint
npm run build
```

Tests use alias-aware TypeScript configuration in `tsconfig.test.json` and jsdom browser API polyfills in `src/setupTests.ts`.

## Samples

Basic Kanban board:

<p align="center">
  <img src="https://raw.githubusercontent.com/christianjtr/simple-task-manager/main/samples/kanban.gif" alt="Kanban board sample" />
</p>
