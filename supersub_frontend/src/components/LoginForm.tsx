"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import styles from "../app/auth/login/login.module.css";
import { AuthService } from "../services/auth/auth.service";
import { LoginCredentials } from "../services/auth/auth.types";
import { ApiError } from "../utils/api";
import { useUser } from "../contexts/UserContext";

// Zod schema for login form validation
const loginSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { refreshUser } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);

    try {
      const credentials: LoginCredentials = {
        email: data.email,
        password: data.password,
      };

      const response = await AuthService.signin(credentials);
      console.log(response);
      if (response.data) {
        // Successful login - refresh user context and redirect to dashboard
        await refreshUser();
        router.push("/dashboard");
      }
    } catch (err) {
      const apiError = err as ApiError;
      console.log("PLOP", apiError);
      setError(apiError.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className={styles.loginContent}>
      <div className={styles.loginFormContainer}>
        <div className={styles.loginHeader}>
          <h1>Welcome to Supersub !</h1>
          <p>Please sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              {...register("email")}
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
            {errors.email && (
              <span className="errorMessage">{errors.email.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              {...register("password")}
              placeholder="Enter your password"
              disabled={isSubmitting}
            />
            {errors.password && (
              <span className="errorMessage">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
          {error && (
            <div className="errorMessage" style={{ marginBottom: "1rem" }}>
              {error}
            </div>
          )}
        </form>

        <div className={styles.loginFooter}>
          <p style={{ marginTop: "15px", color: "#6b7280", fontSize: "14px" }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className={styles.forgotPassword}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
