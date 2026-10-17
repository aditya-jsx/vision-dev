# Vision

Describe an app in plain English and Vision writes it, installs it and runs it, all inside your browser. You get a file explorer, a Monaco editor, a real terminal and a live preview, and you can keep chatting to change the code.

<!-- TODO: add a demo GIF here -->

## Features

- **Prompt to running app.** Gemini 2.5 Flash generates a full React (Vite + Tailwind) or Node project from one prompt.
- **In-browser sandbox.** Code runs in a [WebContainer](https://webcontainers.io), a Node.js runtime inside the browser tab. No server-side execution and no setup.
- **Real dev environment.** File tree, Monaco editor with save, an xterm.js shell (`jsh`) and a live preview iframe.
- **Iterative chat.** Follow-up messages edit the existing project instead of starting over.
- **Export.** Download the project as a Prettier-formatted `.zip`.
- **Auth and projects.** Google and GitHub sign-in through NextAuth, with projects stored in Postgres through Prisma.

## How it works

```mermaid
flowchart LR
  P[User prompt] --> S["/api/skeleton<br/>pick react or node"]
  S --> T[Template files]
  T --> C["/api/chat<br/>Gemini 2.5 Flash"]
  C --> X["visionArtifact XML"]
  X --> PX[parseXml<br/>path validation]
  PX --> ST[Steps queue]
  ST --> WC[WebContainer fs]
  WC --> SH[jsh: npm install && npm run dev]
  SH --> PV[Preview iframe]
```

1. **Pick a template.** `/api/skeleton` asks the model whether the prompt calls for a `react` or `node` project and returns the matching starter files.
2. **Generate.** `/api/chat` sends the system prompt, the template and the user prompt to Gemini. The model replies with a single `<visionArtifact>` block.
3. **Parse.** `app/utils/parseXml.ts` turns each `<visionAction>` into a step:

   ```xml
   <visionArtifact title="Todo App">
     <visionAction type="file" filePath="src/App.tsx">...file contents...</visionAction>
     <visionAction type="shell">npm install</visionAction>
   </visionArtifact>
   ```

   File paths are normalized, and any path that tries to escape the project root (`..`, drive letters) is dropped.
4. **Execute.** The builder works through pending steps one at a time, writing files into the WebContainer and updating the file tree.
5. **Run.** **Run** sends `npm install` and `npm run dev` to the shell. When WebContainer emits `server-ready`, the preview loads.

WebContainers need cross-origin isolation, so `next.config.ts` sets `Cross-Origin-Embedder-Policy: credentialless` and `Cross-Origin-Opener-Policy: same-origin` on every route.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Google Gemini (`@google/genai`) · WebContainer API · Monaco · xterm.js · NextAuth · Prisma 7 + PostgreSQL · JSZip + Prettier

## Getting started

Requires Node 20+ and a PostgreSQL database.

```bash
git clone git@github.com:aditya-jsx/vision-dev.git
cd vision-dev
npm install
```

Create `.env`:

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/vision
GEMINI_API_KEY=...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...            # openssl rand -base64 32
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_ID=...
GITHUB_SECRET=...
```

Run migrations, then start the dev server:

```bash
npx prisma migrate dev
npm run dev
```

Open http://localhost:3000. Use Chrome or Edge, since WebContainers have limited support in Safari and Firefox.

## Project structure

```
app/
  api/
    auth/        NextAuth (Google, GitHub)
    chat/        Gemini code generation
    projects/    list / create projects
    skeleton/    react vs node template picker
  builder/       the IDE: chat, explorer, editor, terminal, preview
    hooks/       useStepRunner (step queue + file tree), useProjectChat (AI calls)
  dashboard/     project list
  hooks/         useWebContainer (boot, shell, preview URL)
  prompts/       system prompt + React/Node templates
  utils/         parseXml, safePath, fileTree, exportZip
prisma/          schema + migrations
```

## Checks

```bash
node app/utils/checks.mjs
```
