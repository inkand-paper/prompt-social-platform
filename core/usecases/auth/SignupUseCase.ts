import { IAuthRepository } from '@/core/repositories/IAuthRepository'
import { IUserRepository } from '@/core/repositories/IUserRepository'
import { PasswordValidator } from '@/core/usecases/validators/PasswordValidator'

export class SignUpUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(input: {
    email: string
    password: string
    username: string
    fullName?: string
  }) {
    // Validate email
    if (!/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(input.email)) {
      return { success: false, error: { code: 'INVALID_EMAIL', message: 'Invalid email address' } }
    }

    // Validate password
    const passwordValidation = PasswordValidator.validate(input.password)
    if (!passwordValidation.isValid) {
      return { success: false, error: { code: 'WEAK_PASSWORD', message: `Password must contain ${passwordValidation.errors.join(', ')}` } }
    }

    // Check username
    const usernameTaken = await this.userRepository.findByUsername(input.username)
    if (usernameTaken) {
      return { success: false, error: { code: 'USERNAME_TAKEN', message: 'Username already taken' } }
    }

    // Check email
    const existingUser = await this.userRepository.findByEmail(input.email)
    if (existingUser) {
      return { success: false, error: { code: 'EMAIL_ALREADY_EXISTS', message: 'Email already registered' } }
    }

    // Create user
    const result = await this.authRepository.signUp(input.email, input.password, {
      username: input.username,
      full_name: input.fullName
    })

    return { success: true, data: result }
  }
}