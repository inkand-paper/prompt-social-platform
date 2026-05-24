// types/errors.ts
export type AuthErrorCode = 
  | 'INVALID_EMAIL'
  | 'WEAK_PASSWORD'
  | 'EMAIL_ALREADY_EXISTS'
  | 'USERNAME_TAKEN'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_CONFIRMED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR'

export interface AuthError {
  code: AuthErrorCode
  message: string
  userMessage: string
  details?: string
}

export interface AuthResult<T = any> {
  success: boolean
  data?: T
  error?: AuthError
}