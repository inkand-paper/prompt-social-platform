export interface PasswordResetRequest {
  email: string
  resetToken: string
  expiresAt: Date
}

export interface PasswordResetInput {
  token: string
  newPassword: string
  confirmPassword: string
}