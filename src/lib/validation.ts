// Input validation helper
export function validateInput(data: any, rules: Record<string, any>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]
    
    // Required check
    if (rule.required && (!value || value === '')) {
      errors.push(`${field} is required`)
      continue
    }
    
    if (value) {
      // Type check
      if (rule.type && typeof value !== rule.type) {
        errors.push(`${field} must be of type ${rule.type}`)
      }
      
      // Length check
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`)
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${field} must be at most ${rule.maxLength} characters`)
      }
      
      // Pattern check
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`${field} format is invalid`)
      }
      
      // Email check
      if (rule.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push(`${field} must be a valid email address`)
      }
      
      // Sanitization check for XSS
      if (typeof value === 'string' && /<script|javascript:|on\w+=/i.test(value)) {
        errors.push(`${field} contains potentially dangerous content`)
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// SQL injection prevention
export function sanitizeSQL(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/xp_/gi, '')
    .replace(/sp_/gi, '')
}