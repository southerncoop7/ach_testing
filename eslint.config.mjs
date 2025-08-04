// @ts-check

// Import necessary Node.js modules for handling file paths.
import { dirname } from "path";
import { fileURLToPath } from "url";

// Import FlatCompat for using legacy ESLint configurations in the new flat config format.
import { FlatCompat } from "@eslint/eslintrc";

// Get the current filename and directory path, which are not available in ES modules by default.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a compatibility utility to use older ESLint configurations.
const compat = new FlatCompat({
  baseDirectory: __dirname, // Set the base directory for resolving plugins and extend paths.
});

/**
 * The main ESLint configuration array for the project.
 * It uses the compatibility layer to extend Next.js recommended rules.
 *
 * @type {import('eslint').Linter.FlatConfig[]}
 */
const eslintConfig = [
  // Extend the recommended ESLint configurations for Next.js projects.
  // 'next/core-web-vitals' includes rules for performance and best practices.
  // 'next/typescript' includes rules for TypeScript-specific code.
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

// Export the configuration for ESLint to use.
export default eslintConfig;