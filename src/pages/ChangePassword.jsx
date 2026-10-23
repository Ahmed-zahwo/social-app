import { useState } from "react";
import { LockKeyhole, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { apiRequest } from "../services/api";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword.length < 8) {
      setError("The new password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("Choose a password different from the current one.");
      return;
    }

    setLoading(true);

    try {
      await apiRequest("/users/change-password", {
        method: "PATCH",
        body: JSON.stringify({
          password: currentPassword,
          newPassword: newPassword,
        }),
      });

      setMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Could not change password.");
    } finally {
      setLoading(false);
    }
  }

  const inputClasses =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground transition-colors duration-300">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors duration-300 sm:p-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-accent p-3 text-primary">
            <LockKeyhole size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Change Password
            </h1>
            <p className="mt-1 text-sm text-muted">
              Update your account password.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="currentPassword"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Current password
            </label>

            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              New password
            </label>

            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className={inputClasses}
              minLength={8}
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Confirm new password
            </label>

            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={inputClasses}
              minLength={8}
              required
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger"
            >
              {error}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </main>
  );
}