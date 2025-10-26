/**
 * Mobile Forms - Refactored for Modularity
 * Re-exports from modular form system for backward compatibility
 */

// Re-export all form components from the modular system
export * from './forms'

// Re-export specific components with backward-compatible names
export {
  MobileForm as MobileForm,
  MobileInput as MobileInput,
  MobileTextarea as MobileTextarea,
  MobileNumberInput as MobileNumberInput,
  MobileSelect as MobileSelect,
  MobileCheckbox as MobileCheckbox
} from './forms'