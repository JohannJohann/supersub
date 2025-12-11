"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import styles from "../app/auth/signup/signup.module.css";
import { AuthService } from "../services/auth/auth.service";
import { SignupCredentials } from "../services/auth/auth.types";
import { ApiError } from "../utils/api";

// Zod schema for signup form validation
const signupSchema = z
  .object({
    firstname: z
      .string()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters"),
    lastname: z
      .string()
      .min(1, "Last name is required")
      .min(2, "Last name must be at least 2 characters"),
    email: z
      .email("Please enter a valid email address")
      .min(1, "Email is required"),
    age: z
      .number("Age is required")
      .min(13, "You must be at least 13 years old")
      .max(120, "Please enter a valid age"),
    gender: z.enum(["MALE", "FEMALE", "NON_BINARY"], {
      error: "Gender is required",
    }),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 charactersf")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: SignupFormData) => {
    setError(null);

    try {
      const credentials: SignupCredentials = {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        age: data.age,
        gender: data.gender,
        password: data.password,
        confirmPassword: data.confirmPassword,
      };

      const response = await AuthService.signup(credentials);

      if (response.data) {
        // Successful signup - redirect to dashboard
        router.push("/dashboard");
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Signup failed. Please try again.");
    }
  };

  return (
    <div className={styles.signupContent}>
      <div className={styles.signupFormContainer}>
        <div className={styles.signupHeader}>
          <h1>Create Account</h1>
          <p>Join us today and get started</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.signupForm}>
          <div className={styles.nameRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                {...register("firstname")}
                placeholder="Enter your first name"
                disabled={isSubmitting}
              />
              {errors.firstname && (
                <span className="errorMessage">{errors.firstname.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                {...register("lastname")}
                placeholder="Enter your last name"
                disabled={isSubmitting}
              />
              {errors.lastname && (
                <span className="errorMessage">{errors.lastname.message}</span>
              )}
            </div>
          </div>

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

          <div className={styles.nameRow}>
            <div className={styles.formGroup}>
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                {...register("age", { valueAsNumber: true })}
                placeholder="Enter your age"
                disabled={isSubmitting}
                min="13"
                max="120"
              />
              {errors.age && (
                <span className="errorMessage">{errors.age.message}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="gender">Gender</label>
              <select id="gender" {...register("gender")} disabled={isSubmitting}>
                <option value="">Select your gender</option>
                <option value="MALE">Man</option>
                <option value="FEMALE">Woman</option>
                <option value="NON_BINARY">Non-binary</option>
              </select>
              {errors.gender && (
                <span className="errorMessage">{errors.gender.message}</span>
              )}
            </div>
          </div>

          <div className={styles.nameRow}>
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                {...register("password")}
                placeholder="Enter your password"
                disabled={isSubmitting}
              />

              {errors.password ? (
                <span className="errorMessage">{errors.password.message}</span>
              ) : (
                <small
                  style={{
                    color: "#6b7280",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  Password must be at least 6 characters with one uppercase letter
                  and one number
                </small>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                {...register("confirmPassword")}
                placeholder="Confirm your password"
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <span className="errorMessage">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className={styles.signupButton}
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        {error && (
          <div className="errorMessage" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}
        <div className={styles.signupFooter}>
          <p>
            Already have an account?{" "}
            <Link href="/auth/login" className={styles.loginLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}