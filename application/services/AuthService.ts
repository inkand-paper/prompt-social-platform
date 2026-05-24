import { IAuthRepository } from '@/core/repositories/IAuthRepository'
import { IUserRepository } from '@/core/repositories/IUserRepository'
import { SignUpUseCase } from '@/core/usecases/auth/SignupUseCase'
import { LoginUseCase } from '@/core/usecases/auth/LoginUseCase'
import { ForgotPasswordUseCase } from '@/core/usecases/auth/ForgotPasswordUseCase'
import { ResetPasswordUseCase } from '@/core/usecases/auth/ResetPasswordUseCase'
import { LoginDTO, LoginResponseDTO } from '@/application/dto/LoginDTO'
import { SignUpDTO, SignUpResponseDTO } from '@/application/dto/SignUpDTO'
import { ForgotPasswordDTO, ResetPasswordDTO, PasswordResetResponseDTO } from '@/application/dto/PasswordResetDTO'

export class AuthService {
  constructor(
    private authRepository: IAuthRepository,
    private userRepository: IUserRepository
  ) {}

  async signUp(input: SignUpDTO): Promise<{ success: boolean; data?: SignUpResponseDTO; error?: any }> {
    const signUpUseCase = new SignUpUseCase(this.authRepository, this.userRepository)
    const result = await signUpUseCase.execute(input)
    
    if (!result.success) {
      return { success: false, error: result.error }
    }
    
    return {
      success: true,
      data: {
        user: result.data?.user as any,
        requiresEmailConfirmation: result.data?.requiresConfirmation as any
      }
    }
  }

  async login(input: LoginDTO): Promise<{ success: boolean; data?: LoginResponseDTO; error?: any }> {
    const loginUseCase = new LoginUseCase(this.authRepository)
    const result = await loginUseCase.execute(input.email, input.password)
    
    if (!result.success) {
      return { success: false, error: result.error }
    }
    
    return {
      success: true,
      data: {
        user: result.data?.user as any,
        accessToken: result.data?.accessToken as any
      }
    }
  }

  async forgotPassword(input: ForgotPasswordDTO): Promise<PasswordResetResponseDTO> {
    const forgotPasswordUseCase = new ForgotPasswordUseCase(this.authRepository)
    const result = await forgotPasswordUseCase.execute(input.email)
    return { success: result.success, message: result.message || '' }
  }

  async resetPassword(input: ResetPasswordDTO): Promise<PasswordResetResponseDTO> {
    const resetPasswordUseCase = new ResetPasswordUseCase(this.authRepository)
    const result = await resetPasswordUseCase.execute(input.newPassword, input.confirmPassword)
    return { success: result.success, message: result.message || '' }
  }

  async logout(): Promise<void> {
    await this.authRepository.signOut()
  }

  async getCurrentUser() {
    return await this.authRepository.getCurrentUser()
  }
}