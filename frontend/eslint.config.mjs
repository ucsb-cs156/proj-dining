import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import reactPlugin from "eslint-plugin-react";
import { defineConfig, globalIgnores } from "eslint/config";

// Import the vitest plugin
import vitest from "@vitest/eslint-plugin";
import plugin from "eslint-plugin-testing-library";

export default defineConfig([
    globalIgnores([
        "dist",
        ".stryker-tmp/",
        ".storybook/",
        "build",
        "coverage",
        "node_modules",
        "public/mockServiceWorker.js",
        "storybook-static/",
    ]),
    {
        files: ["src/**/*.{js,jsx}"],
        extends: [
            js.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
            reactPlugin.configs.flat.recommended,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: "latest",
                ecmaFeatures: { jsx: true },
                sourceType: "module",
            },
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            "no-unused-vars": [
                "error",
                { varsIgnorePattern: "^[A-Z_].*", argsIgnorePattern: "^_" },
            ],
            "react/prop-types": "off",
            "react/react-in-jsx-scope": "off",
            // These rules were added in eslint-plugin-react-hooks 7 (derived
            // from the React Compiler) and flag pre-existing code; turned off
            // rather than refactoring as part of the dependency upgrade.
            // See https://github.com/ucsb-cs156/proj-dining/issues/159
            "react-hooks/set-state-in-effect": "off",
            "react-hooks/immutability": "off",
        },
    },
    {
        ...plugin.configs["flat/react"],
        // Apply this configuration only to test files
        files: ["**/*.test.{js,jsx}", "**/*.spec.{js,jsx}"],
        plugins: {
            vitest,
        },
        languageOptions: {
            globals: { ...vitest.environments.env.globals, ...globals.node }, // Use vitest's globals
        },
        rules: {
            // Vitest recommended rules
            ...vitest.configs.recommended.rules,
            "vitest/expect-expect": "off",
        },
    },
]);