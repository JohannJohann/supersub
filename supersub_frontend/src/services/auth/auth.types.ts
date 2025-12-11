// Auth-related types
import { Offer } from "../subscription/subscription.types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  firstname: string;
  lastname: string;
  email: string;
  age: number;
  gender: "MALE" | "FEMALE" | "NON_BINARY";
  password: string;
  confirmPassword: string;
}

export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  age: number;
  gender: string;
  offer?: Offer | null;
  previous_offer?: Offer | null;
}

export interface AuthResponse {
  user: User;
  message: string;
}

export interface LogoutResponse {
  message: string;
}
