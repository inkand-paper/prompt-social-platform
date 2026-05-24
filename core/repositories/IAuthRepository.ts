import { User } from '@/core/entities/User'
import { AuthSession } from '@/core/entities/AuthSession'

export interface IAuthRepository {
  signUp(email: string, password: string, metadata: any): Promise<{user: User, requiresConfirmation: boolean}>
  signIn(email: string, password: string): Promise<AuthSession>
  signOut(): Promise<void>
  resetPassword(email: string): Promise<void>
  updatePassword(newPassword: string): Promise<void>
  getCurrentUser(): Promise<User | null>
  resendConfirmationEmail(email: string): Promise<void>
}
