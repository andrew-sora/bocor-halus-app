# Agent Guidelines & Constraints

## 🛑 Tool Usage Rules
- **NEVER use `browser_subagent`**: Using the browser subagent is strictly forbidden. It is slow and consumes excessive tokens.
- Always use terminal commands (`npm test`, `npx tsc`, `npx eslint`), code analysis, or direct responses instead of browser subagent visual checks.
