export interface User {
  id: number
  username: string
  email: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginResponse {
  access: string
  refresh: string
}

export interface RefreshResponse {
  access: string
  refresh?: string
}

export interface RegisterResponse {
  message: string
  user: User
}
