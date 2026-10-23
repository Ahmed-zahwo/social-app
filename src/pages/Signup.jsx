import { useState } from "react";
import { apiRequest } from "../services/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link , useNavigate  } from "react-router";
import {
  UserRound,
  Mail,
  LockKeyhole,
  CalendarDays,
  AtSign,
} from "lucide-react";

import { signupSchema } from "../schemas/auth.schema";

function Signup() {
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      dateOfBirth: "",
      gender: "male",
      password: "",
      rePassword: "",
    },
  });

  

async function onSubmit(data) {
  setMessage('')
  setErrorMessage('')

  try {
    await apiRequest('/users/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    setMessage('Account created successfully!')
    navigate('/login', { replace: true })
  } catch (error) {
    setErrorMessage(
      error.message || 'Unable to create your account.'
    )
  }
}



  const password = watch("password");

  const inputClass =
    "w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

  const errorClass = "mt-1 text-sm text-danger";

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto grid min-h-[80vh] max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl md:grid-cols-2">
        <section className="hidden flex-col justify-between bg-linear-to-br from-violet-600 via-purple-600 to-indigo-800 p-10 text-white md:flex">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Vibely<span className="text-cyan-300">.</span>
            </h1>
            <p className="mt-3 text-sm text-white/70">
              Your people. Your moments. Your vibe.
            </p>
          </div>

          <div>
            <div className="mb-5 flex gap-2">
              <span className="h-2 w-10 rounded-full bg-cyan-300" />
              <span className="h-2 w-2 rounded-full bg-white/50" />
              <span className="h-2 w-2 rounded-full bg-white/50" />
            </div>

            <h2 className="text-4xl font-bold leading-tight">
              Make room for
              <br />
              your kind of vibe.
            </h2>

            <p className="mt-4 max-w-sm leading-7 text-white/75">
              Connect with friends, share your moments, and discover what's
              happening around you.
            </p>
          </div>

          <p className="text-xs text-white/60">
            © 2026 Vibely. Made for your moments.
          </p>
        </section>

        <section className="p-6 sm:p-10">
          <div className="mb-8 md:hidden">
            <h1 className="text-3xl font-black text-primary">Vibely.</h1>
          </div>

          <div className="mb-7">
            <p className="mb-2 text-sm font-semibold text-primary">
              JOIN THE COMMUNITY
            </p>
            <h2 className="text-3xl font-bold">Create account</h2>
            <p className="mt-2 text-sm text-muted">
              Start sharing your world with Vibely.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            {message && (
              <p
                role="status"
                className="rounded-xl bg-green-100 p-3 text-sm text-green-800"
              >
                {message}
              </p>
            )}

            {errorMessage && (
              <p
                role="alert"
                className="rounded-xl bg-red-100 p-3 text-sm text-red-700"
              >
                {errorMessage}
              </p>
            )}
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium"
              >
                Full name
              </label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
                <input
                  id="name"
                  {...register("name")}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className={inputClass}
                />
              </div>
              {errors.name && (
                <p className={errorClass}>{errors.name.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-medium"
              >
                Username
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
                <input
                  id="username"
                  {...register("username")}
                  placeholder="Choose a username"
                  autoComplete="username"
                  className={inputClass}
                />
              </div>
              {errors.username && (
                <p className={errorClass}>{errors.username.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
              {errors.email && (
                <p className={errorClass}>{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Date of birth
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
                  <input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                    className="w-full min-w-0 rounded-xl border border-border bg-background py-3 pl-10 pr-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className={errorClass}>{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  {...register("gender")}
                  className="w-full rounded-xl border border-border bg-background px-3 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.gender && (
                  <p className={errorClass}>{errors.gender.message}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium"
              >
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  className={inputClass}
                />
              </div>
              {errors.password && (
                <p className={errorClass}>{errors.password.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="rePassword"
                className="mb-1.5 block text-sm font-medium"
              >
                Confirm password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
                <input
                  id="rePassword"
                  type="password"
                  {...register("rePassword")}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  className={inputClass}
                />
              </div>
              {errors.rePassword && (
                <p className={errorClass}>{errors.rePassword.message}</p>
              )}
              {password && !errors.rePassword && (
                <p className="mt-1 text-xs text-muted">
                  Confirm your password before creating your account.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-primary px-5 py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default Signup;
