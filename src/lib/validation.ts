// Input validation helper
export function validateInput(data: any, rules?: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]
    
    // Required check
    if (rule?.required && (!value || value === '')) {
      errors.push(`validation.fieldRequired`)
      continue
    }
    
    if (value) {
      // Type check
      if (rule?.type && typeof value !== rule?.type) {
        errors.push(`validation.invalidType`)
      }
      
      // Length check
      if (rule?.minLength && value.length < rule?.minLength) {
        errors.push(`validation.minLength`)
      }
      
      if (rule?.maxLength && value.length > rule?.maxLength) {
        errors.push(`validation.maxLength`)
      }
      
      // Pattern check
      if (rule?.pattern && !rule?.pattern?.test(data[field])) {
        errors.push(`validation.invalidFormat`)
      }
      
      // Email check
      if (rule?.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[field])) {
        errors.push(`validation.invalidEmail`)
      }
      
      // Sanitization check for XSS
      if (typeof value === 'string' && /<script|javascript:|on\w+=/i.test(value)) {
        errors.push(`validation.dangerousContent`)
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
    .replace(/'/g,"''")
    .replace(/;/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/xp_/gi, '')
    .replace(/sp_/gi, '')
}