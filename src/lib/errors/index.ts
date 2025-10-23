/**
 * Barrel export for error handling
 * 
 * Usage:
 *   import { AppError, ValidationError, handleError } from '@/lib/errors'
 */

export type { ErrorCode, ErrorDetails } from './AppError'
export {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  DatabaseError,
  AuthError,
  NetworkError,
  handleError,
  getErrorMessage,
  logError,
} from './AppError'
