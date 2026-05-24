import { IAuthRepository } from '@/core/repositories/IAuthRepository'

export class ForgotPasswordUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(email: string) {
    if (!email || !email.includes('@')) {
      return { success: false, error: { code: 'INVALID_EMAIL', message: 'Valid email required' } }
    }

    await this.authRepository.resetPassword(email)
    return { success: true, message: 'Reset link sent if account exists' }
  }
}