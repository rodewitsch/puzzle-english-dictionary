import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["**/*.js"], languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        ...globals.serviceworker,
        CorePuzzleEnglishDictionaryModule: true,
        ExtStore: true,
      }, sourceType: "script"
    }
  },
  {
    files: ["scripts/**/*.js", "scripts/**/*.mjs", "tests/**/*.js", "tests/**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: "module",
    },
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
];