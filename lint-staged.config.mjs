import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const quote = (value) => `"${value.replaceAll(/(["\\$`])/g, "\\$1")}"`;

const workspacePath = (workspaceDir) => path.join(rootDir, workspaceDir);

const relativeToWorkspace = (workspaceDir, files) =>
  files
    .map((file) => quote(path.relative(workspacePath(workspaceDir), file)))
    .join(" ");

export const baseConfig = {
  "*.{ts,tsx,js,jsx,mjs,cjs}": "prettier --write",
  "*.{css,json,md}": "prettier --write",
};

export const workspaceConfig = (workspaceDir) => ({
  ...baseConfig,
  "*.{ts,tsx,js,jsx,mjs,cjs}": [
    "prettier --write",
    (files) =>
      `bun run --cwd ${quote(workspacePath(workspaceDir))} lint -- ${relativeToWorkspace(
        workspaceDir,
        files,
      )}`,
  ],
});

export default baseConfig;
