# AI Use Record

| Tool name | Purpose | Important prompts | Files affected | How we verified |
| --- | --- | --- | --- | --- |
| VS Code AI assistant (GitHub Copilot) | Updated the Expo app to match the assignment brief, fixed validation and navigation issues, and prepared the submission docs. | "Work inside the existing project. Do not invent any data. Fix group code, validation, and navigation. Run tsc after changes. Keep group data in a single source of truth." | `src/constants/group.ts`, `src/screens/MarketCatalog.tsx`, `src/screens/InspectionForm.tsx`, `src/navigation/DetailScreen.tsx`, `README.md`, `evidence/AI_USE.md`, `evidence/VIDEO_SCRIPT.md`, `evidence/CONTRIBUTIONS_SOURCE.md` | Tested on Expo Go, Android, manual checklist + `npx tsc --noEmit` |
| Git (`git status`, `git diff --stat`) | Confirmed the real repository state and tracked file changes before submission. | "Check repo state and file modifications for the evidence table." | `.gitignore`, `README.md`, `src/**`, `evidence/**` | Verified by git output and final diff review |
