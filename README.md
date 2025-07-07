# Echo

Create voice assistants through voice

## Prerequisites

- Node.js ≥ 18
- **pnpm ≥ 8** (install with `npm i -g pnpm`)

---

## Getting Started (monorepo)

### 1. Install dependencies (once):

```bash
pnpm install
```

Because this is a pnpm workspace, a single `pnpm install` at the root links all dependencies for `server` and `client`.

### 2. Start both client and server together

```bash
pnpm dev
```

This runs the script defined in the root `package.json`, which concurrently launches:

- `server` on http://localhost:3000
- `client` (Vite) on http://localhost:5173 with API proxy

### 3. Build for production

```bash
pnpm build
```

The command sequentially builds the server (`server/dist`) and the client (`client/dist`).

---
