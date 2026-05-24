import { IAuthRepository } from '@/core/repositories/IAuthRepository'

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(email: string, password: string) {
    if (!email || !password) {
      return { success: false, error: { code: 'MISSING_FIELDS', message: 'Email and password required' } }
    }

    try {
      const session = await this.authRepository.signIn(email, password)
      return { success: true, data: session }
    } catch (error: any) {
      if (error.message === 'Email not confirmed') {
        return { success: false, error: { code: 'EMAIL_NOT_CONFIRMED', message: 'Please verify your email before logging in' } }
      }
      return { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } }
    }
  }
}