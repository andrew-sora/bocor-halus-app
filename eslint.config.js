// @ts-check
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const reactPlugin = require("eslint-plugin-react");

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
    },
    rules: {
      // TypeScript
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      // React
      "react/react-in-jsx-scope": "off",
      // Security: forbid eval
      "no-eval": "error",
      "no-new-func": "error",
    },
  },
  {
    ignores: ["node_modules/**", ".expo/**", "dist/**"],
  },
];
