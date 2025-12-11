import { api, ApiResponse, ApiError } from "../../utils/api";
import {
  LoginCredentials,
  SignupCredentials,
  User,
  AuthResponse,
  LogoutResponse,
} from "./auth.types";

// Auth service class
export class AuthService {
  /**
   * Sign in user with email and password
   */
  static async signin(
    credentials: LoginCredentials
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);
      return response;
    } catch (error) {
      throw error as ApiError;
    }
  }

  /**
   * Sign up new user
   */
  static async signup(
    credentials: SignupCredentials
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await api.post<AuthResponse>(
        "/auth/signup",
        credentials
      );
      return response;
    } catch (error) {
      throw error as ApiError;
    }
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<ApiResponse<LogoutResponse>> {
    try {
      const response = await api.post<LogoutResponse>("/auth/logout");
      return response;
    } catch (error) {
      throw error as ApiError;
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await api.get<User>("/auth/me");
      return response;
    } catch (error) {
      throw error as ApiError;
    }
  }
}

export default AuthService;
