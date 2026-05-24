export class PasswordValidator {
  static validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (password.length < 8) errors.push('at least 8 characters')
    if (!/[A-Z]/.test(password)) errors.push('an uppercase letter')
    if (!/[a-z]/.test(password)) errors.push('a lowercase letter')
    if (!/[0-9]/.test(password)) errors.push('a number')
    if (!/[!@#$%^&*]/.test(password)) errors.push('a special character (!@#$%^&*)')
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}