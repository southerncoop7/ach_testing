/**
 * This file serves as a "barrel" for all the custom hooks in this directory.
 * It re-exports all the hooks from a single module, which allows for
 * cleaner and more convenient imports in other parts of the application.
 *
 * For example, instead of:
 * import { useLocalStorage } from './hooks/useLocalStorage';
 *
 * You can do:
 * import { useLocalStorage } from './hooks';
 */

export { useLocalStorage } from './useLocalStorage';
