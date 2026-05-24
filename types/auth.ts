// types/auth.ts
export interface User {
  id: string
  email: string
  username: string
  full_name: string | null
  avatar_url: string | null
}

export interface LoginInput {
  email: string
  password: string
}

export interface SignupInput extends LoginInput {
  username: string
  full_name?: string
}

export interface AuthResponse {
  user: User | null
  error: string | null
}