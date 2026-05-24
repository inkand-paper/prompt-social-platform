export interface LoginDTO {
  email: string
  password: string
}

export interface LoginResponseDTO {
  user: {
    id: string
    email: string
    username: string
    fullName: string | null
  }
  accessToken: string
}