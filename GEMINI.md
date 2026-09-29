# Family Planner Project Rules

These are the core guidelines and instructions you must follow as an AI assistant when working on this repository. Read these carefully at the beginning of each conversation and apply them to all your actions.

## 1. Do Not Touch `CLAUDE.md`
- **NEVER** edit, modify, or delete `CLAUDE.md`. This file is used by other tools/agents and modifying it can cause merge conflicts.
- Do not open it unless explicitly requested by the user.

## 2. Project Architecture
- This is a monorepo containing a frontend and a backend.
- **Frontend (`src/app`)**: React + Vite application.
- **Backend (`src/server`)**: Node.js + Express + PostgreSQL.
- Both projects use **TypeScript**.

## 3. Development Workflow
- To run the project locally, use `npm run dev` from the root directory. This runs a concurrently script that starts both the Vite dev server and the Express `ts-node-dev` server.
- The backend runs on port `4000`, the frontend on port `5173`.
- Any frontend API calls should use the base URL appropriately (handled by Vite proxy in development).
- Do NOT use generic bash commands for finding/editing files (like `cat`, `grep`, or `sed`). Use your native tools (`view_file`, `grep_search`, `replace_file_content`, `multi_replace_file_content`).

## 4. Git and Version Control
- Avoid running `git pull` or `git checkout` if there are untracked or uncommitted changes without first asking the user, as this can cause merge conflicts or overwrite their work. 

## 5. Environment and Shell
- The OS is **Windows** and the default shell is **PowerShell**.
- Ensure any terminal commands proposed or executed are compatible with Windows PowerShell (e.g. avoid Unix-specific tools like `head`, use `Get-ChildItem` instead of `ls` if complex scripting is needed, or stick to native OS-agnostic tools).
- Do not use `&&` in older PowerShell versions; execute commands sequentially if needed.

## 6. Token Authentication
- The application uses JWT for authentication.
- A `401 Invalid Token` error requires clearing local storage (`auth_token`, `member_token`, etc.) and logging back in. The frontend should gracefully handle this by invoking `logout()`.

## 7. Sensitive Files and Secrets
- **NEVER** open, read, or display the contents of sensitive files (such as `.env`, `.env.production`, certificates, or private keys) unless explicitly asked to do so by the user to debug a specific configuration issue.
- Do not log or print passwords, secrets, or API keys in the chat.
