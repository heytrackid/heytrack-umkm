// =============================================
// HEYTRACK - Business Management System
// Main Index File
// =============================================

// Export all types
export * from './types/business';
export * from './types/supplier';

// Export services
export * from './services/businessApi';

// Export utilities
export { logger } from './src/utils/logger';
export { supabase, checkSupabaseConnection } from './src/lib/supabase';

// Database exports
export * from './database';

// Constants
export const HEYTRACK_VERSION = '1.0.0';
export const MODULE_NAME = 'HeyTrack Business Management System';
