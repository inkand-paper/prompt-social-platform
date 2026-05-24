import { IAuthRepository } from '@/core/repositories/IAuthRepository'
import { PasswordValidator } from '@/core/usecases/validators/PasswordValidator'

export class ResetPasswordUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(newPassword: string, confirmPassword: string) {
    if (newPassword !== confirmPassword) {
      return { success: false, error: { code: 'PASSWORD_MISMATCH', message: 'Passwords do not match' } }
    }

    const validation = PasswordValidator.validate(newPassword)
    if (!validation.isValid) {
      return { success: false, error: { code: 'WEAK_PASSWORD', message: `Password must contain ${validation.errors.join(', ')}` } }
    }

    await this.authRepository.updatePassword(newPassword)
    return { success: true, message: 'Password reset successfully' }
  }
}