// 🌸 Miara — ESLint + Prettier Flat Config (2025 Edition)
// ESM-compatible harmony setup 🌙

import js from "@eslint/js";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default [
  {
    ignores: ["node_modules", "sessions", "session", "coverage", "dist", "build", "*.log", "*.tmp"]
  },

  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node
    },
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      ...js.configs.recommended.rules,
      ...prettierConfig.rules,

      // 🌷 Developer comfort rules
      "no-console": "off",
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "no-useless-escape": "off",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ],

      // 🌙 Prettier formatting enforcement
      "prettier/prettier": [
        "warn",
        {
          singleQuote: false,
          semi: true,
          trailingComma: "none",
          printWidth: 100,
          tabWidth: 2,
          bracketSpacing: true,
          endOfLine: "auto"
        }
      ]
    }
  }
];
