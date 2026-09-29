# Rule: Do Not Use Browser Subagent

- **STRICT RESTRICTION**: NEVER call the `browser_subagent` tool.
- **Rationale**: Using the browser subagent consumes excessive tokens and takes too long, making execution inefficient.
- **Alternative**: Always rely on direct terminal outputs, code inspection, unit test runs (`npm test`), TypeScript verification (`npx tsc`), or direct HTTP/curl checks if needed.
