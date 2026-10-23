import CreatePost from "../components/CreatePost";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  House,
  Bell,
  LogOut,
  UserRound,
  LockKeyhole,
  Moon,
  Sun,
} from "lucide-react";
import { apiRequest } from "../services/api";
import PostCard from "../components/PostCard";

export default function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/posts");

      setPosts(Array.isArray(response?.data?.posts) ? response.data.posts : []);
    } catch (err) {
      if (err.status === 401) {
        setError("Please log in again.");
      } else {
        setError(err.message || "Failed to load posts.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePostCreated() {
    await loadPosts();
  }

  function handlePostUpdate(postId, changes) {
    if (changes.refresh) {
      loadPosts();
      return;
    }

    setPosts((previous) =>
      previous.map((post) => {
        const id = post.id || post._id;

        return id === postId ? { ...post, ...changes } : post;
      }),
    );
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 text-foreground backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <button
            onClick={toggleTheme}
            title={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
            className="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-violet-50 hover:text-violet-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {theme === "light" ? <Moon size={21} /> : <Sun size={21} />}
          </button>
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-extrabold tracking-tight text-violet-600"
          >
            Vibely.
          </button>

          <div className="hidden max-w-sm flex-1 items-center gap-2 rounded-full border border-border bg-accent px-4 py-2.5 transition-colors duration-300 sm:flex">
            <Search size={19} className="text-muted" />

            <input
              type="search"
              placeholder="Search Vibely..."
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Home"
              className="rounded-xl bg-violet-50 p-2.5 text-violet-600"
            >
              <House size={21} />
            </button>

            <button
              aria-label="Notifications"
              className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"
            >
              <Bell size={21} />
            </button>

            <button
              onClick={handleLogout}
              title="Log out"
              className="rounded-xl p-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={21} />
            </button>
            <button
              onClick={() => navigate("/profile")}
              title="My Profile"
              className="rounded-xl p-2.5 text-slate-500 hover:bg-violet-50 hover:text-violet-600"
            >
              <UserRound size={21} />
            </button>

            <button
              onClick={() => navigate("/change-password")}
              title="Change Password"
              aria-label="Change Password"
              className="rounded-xl p-2.5 text-slate-500 hover:bg-violet-50 hover:text-violet-600"
            >
              <LockKeyhole size={21} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 transition-colors duration-300">
            <div className="flex items-center gap-3">
              {user?.photo ? (
                <img
                  src={user.photo}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
                  <UserRound size={24} />
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate font-bold text-foreground">
                  {user?.name || "Vibely User"}
                </p>

                <p className="truncate text-sm text-muted">
                  @{user?.username || "user"}
                </p>
              </div>
            </div>

            <div className="my-5 border-t border-border" />

            <p className="text-sm leading-6 text-muted">
              Welcome back! Discover what your community is sharing.
            </p>
          </div>
        </aside>

        <section className="mx-auto w-full max-w-2xl">
          <div className="mb-5">
            <h1 className="text-2xl font-extrabold">Your Feed</h1>
            <p className="mt-1 text-sm text-slate-500">
              Discover what's happening in your community.
            </p>
          </div>
          <CreatePost user={user} onCreated={handlePostCreated} />
          {loading && (
            <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Loading posts...
            </p>
          )}

          {error && (
            <div className="rounded-2xl border border-danger/20 bg-danger/10 p-5 text-sm text-danger">
              <p>{error}</p>

              {error === "Please log in again." ? (
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login", { replace: true });
                  }}
                  className="mt-3 rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Go to Login
                </button>
              ) : (
                <button
                  onClick={loadPosts}
                  className="ml-3 font-semibold underline"
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              No posts available yet.
            </p>
          )}

          {!loading && !error && (
            <div className="space-y-5">
              {posts.map((post) => (
                <PostCard
                  key={post.id || post._id}
                  post={post}
                  currentUser={user}
                  onPostUpdate={handlePostUpdate}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
