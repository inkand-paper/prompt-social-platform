export interface SignUpDTO {
  email: string
  password: string
  username: string
  fullName?: string
}

export interface SignUpResponseDTO {
  user: {
    id: string
    email: string
    username: string
    fullName: string | null
  }
  requiresEmailConfirmation: boolean
}