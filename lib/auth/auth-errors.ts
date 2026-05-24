// lib/auth/auth-errors.ts
import { AuthError, AuthErrorCode } from '@/types/errors'

const errorMessages: Record<AuthErrorCode, { message: string; userMessage: string }> = {
  INVALID_EMAIL: {
    message: 'Invalid email format',
    userMessage: 'Please enter a valid email address (e.g., name@example.com)'
  },
  WEAK_PASSWORD: {
    message: 'Password is too weak',
    userMessage: 'Password must be at least 8 characters with uppercase, lowercase, and numbers'
  },
  EMAIL_ALREADY_EXISTS: {
    message: 'Email already registered',
    userMessage: 'An account with this email already exists. Please login instead.'
  },
  USERNAME_TAKEN: {
    message: 'Username already taken',
    userMessage: 'This username is already taken. Please choose another one.'
  },
  INVALID_CREDENTIALS: {
    message: 'Invalid email or password',
    userMessage: 'Incorrect email or password. Please try again.'
  },
  EMAIL_NOT_CONFIRMED: {
    message: 'Email not confirmed',
    userMessage: 'Please verify your email address. We sent a confirmation link to your inbox.'
  },
  RATE_LIMIT_EXCEEDED: {
    message: 'Too many attempts',
    userMessage: 'Too many attempts. Please wait a few minutes before trying again.'
  },
  NETWORK_ERROR: {
    message: 'Network error',
    userMessage: 'Unable to connect. Please check your internet connection.'
  },
  SERVER_ERROR: {
    message: 'Server error',
    userMessage: 'Something went wrong on our end. Please try again later.'
  },
  UNKNOWN_ERROR: {
    message: 'Unknown error',
    userMessage: 'An unexpected error occurred. Please try again.'
  }
}

export function mapSupabaseError(error: any): AuthError {
  // Network errors
  if (!error || error.message?.includes('Failed to fetch')) {
    return {
      code: 'NETWORK_ERROR',
      message: errorMessages.NETWORK_ERROR.message,
      userMessage: errorMessages.NETWORK_ERROR.userMessage,
      details: error?.message
    }
  }

  // Rate limiting
  if (error.message?.includes('rate_limit')) {
    return {
      code: 'RATE_LIMIT_EXCEEDED',
      message: errorMessages.RATE_LIMIT_EXCEEDED.message,
      userMessage: errorMessages.RATE_LIMIT_EXCEEDED.userMessage,
      details: error.message
    }
  }

  // Email already exists
  if (error.message?.includes('User already registered')) {
    return {
      code: 'EMAIL_ALREADY_EXISTS',
      message: errorMessages.EMAIL_ALREADY_EXISTS.message,
      userMessage: errorMessages.EMAIL_ALREADY_EXISTS.userMessage,
      details: error.message
    }
  }

  // Invalid credentials
  if (error.message?.includes('Invalid login credentials')) {
    return {
      code: 'INVALID_CREDENTIALS',
      message: errorMessages.INVALID_CREDENTIALS.message,
      userMessage: errorMessages.INVALID_CREDENTIALS.userMessage,
      details: error.message
    }
  }

  // Email not confirmed
  if (error.message?.includes('Email not confirmed')) {
    return {
      code: 'EMAIL_NOT_CONFIRMED',
      message: errorMessages.EMAIL_NOT_CONFIRMED.message,
      userMessage: errorMessages.EMAIL_NOT_CONFIRMED.userMessage,
      details: error.message
    }
  }

  // Weak password
  if (error.message?.includes('password') && error.message?.includes('weak')) {
    return {
      code: 'WEAK_PASSWORD',
      message: errorMessages.WEAK_PASSWORD.message,
      userMessage: errorMessages.WEAK_PASSWORD.userMessage,
      details: error.message
    }
  }

  // Default
  return {
    code: 'UNKNOWN_ERROR',
    message: errorMessages.UNKNOWN_ERROR.message,
    userMessage: errorMessages.UNKNOWN_ERROR.userMessage,
    details: error?.message
  }
}

export function mapCustomError(error: any): AuthError {
  // Username validation
  if (error.message?.includes('username')) {
    return {
      code: 'USERNAME_TAKEN',
      message: errorMessages.USERNAME_TAKEN.message,
      userMessage: errorMessages.USERNAME_TAKEN.userMessage,
      details: error.message
    }
  }

  return mapSupabaseError(error)
}