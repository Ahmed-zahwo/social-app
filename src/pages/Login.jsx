import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, LockKeyhole, LogIn } from "lucide-react";
import { z } from "zod";
import { apiRequest } from "../services/api";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data) {
    setErrorMessage("");

    try {
      const response = await apiRequest("/users/signin", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const token = response?.data?.token;
      const user = response?.data?.user;

      if (!token || !user) {
        throw new Error("Login response is missing session data.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/");
    } catch (error) {
      setErrorMessage(error.message || "Unable to log in.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground transition-colors duration-300">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl shadow-violet-500/5 transition-colors duration-300 sm:p-8">
        <Link
          to="/signup"
          className="text-3xl font-extrabold tracking-tight text-primary transition-opacity hover:opacity-80"
        >
          Vibely.
        </Link>

        <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-primary">
          Welcome back
        </p>

        <h1 className="mt-2 text-3xl font-bold text-foreground">
          Log in to Vibely
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted">
          Sign in and reconnect with your community.
        </p>

        {errorMessage && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              Email or username
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Mail size={19} className="shrink-0 text-muted" />

              <input
                id="email"
                type="text"
                autoComplete="username"
                placeholder="Enter your email or username"
                {...register("email")}
                aria-invalid={Boolean(errors.email)}
                className="w-full min-w-0 bg-transparent py-3.5 text-sm text-foreground outline-none placeholder:text-muted"
              />
            </div>

            {errors.email && (
              <p className="mt-2 text-sm text-danger">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              Password
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <LockKeyhole size={19} className="shrink-0 text-muted" />

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                {...register("password")}
                aria-invalid={Boolean(errors.password)}
                className="w-full min-w-0 bg-transparent py-3.5 text-sm text-foreground outline-none placeholder:text-muted"
              />
            </div>

            {errors.password && (
              <p className="mt-2 text-sm text-danger">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={18} />
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-primary transition-opacity hover:opacity-80"
          >
            Create account
          </Link>
        </p>
      </section>
    </main>
  );
}
