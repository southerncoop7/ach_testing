/**
 * This file serves as a "barrel" for all the UI components in this directory.
 * It re-exports all the UI components from a single module, which allows for
 * cleaner and more convenient imports in other parts of the application.
 *
 * For example, instead of:
 * import { Button } from './components/ui/Button';
 * import { Input } from './components/ui/Input';
 *
 * You can do:
 * import { Button, Input } from './components/ui';
 */

export { Button } from './Button';
export { Input } from './Input';
export { Select } from './Select';
export { ProgressBar } from './ProgressBar';
export { StepIndicator } from './StepIndicator';