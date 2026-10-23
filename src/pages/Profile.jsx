import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, UserRound, ImagePlus } from "lucide-react";
import { apiRequest } from "../services/api";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("posts");
  const [allPosts, setAllPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");

    try {
      const profileResponse = await apiRequest("/users/profile-data");
      const profileData = profileResponse?.data;
      const currentUser =
        profileData?.user || profileData?.profile || profileData;

      setProfile(currentUser);

      const userId = currentUser?._id || currentUser?.id;

      try {
        const feedResponse = await apiRequest(
          "/posts/feed?only=me&page=1&limit=50",
        );

        const feedData = feedResponse?.data;
        const feedPosts =
          feedData?.posts || feedData?.feed || feedData?.docs;

        if (Array.isArray(feedPosts)) {
          setPosts(feedPosts);
        } else {
          setPosts([]);
        }
      } catch {
        const postsResponse = await apiRequest("/posts");
        const postsData = postsResponse?.data;
        const list = postsData?.posts || postsData?.docs || postsData;

        const validPosts = Array.isArray(list) ? list : [];

        setPosts(
          validPosts.filter((post) => {
            const ownerId =
              post.user?._id || post.user?.id || post.userId || post.user;

            return String(ownerId) === String(userId);
          }),
        );
      }

      try {
        const response = await apiRequest("/posts");
        const data = response?.data;
        const list = data?.posts || data?.docs || data;

        setAllPosts(Array.isArray(list) ? list : []);
      } catch {
        setAllPosts([]);
      }
    } catch (err) {
      setError(err.message || "Could not load profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    setSavingPhoto(true);
    setError("");
    setMessage("");

    try {
      const response = await apiRequest("/users/upload-photo", {
        method: "PUT",
        body: formData,
      });

      const updatedUser = response?.data?.user || response?.data;

      if (updatedUser?.photo) {
        setProfile((previous) => ({
          ...previous,
          ...updatedUser,
        }));

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...JSON.parse(localStorage.getItem("user") || "{}"),
            ...updatedUser,
          }),
        );
      } else {
        await loadProfile();
      }

      setMessage(response?.message || "Profile photo updated.");
    } catch (err) {
      setError(err.message || "Could not upload profile photo.");
    } finally {
      setSavingPhoto(false);
      event.target.value = "";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 text-center text-foreground transition-colors duration-300">
        <p className="text-muted">Loading profile...</p>
      </main>
    );
  }

  if (error && !profile) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 text-foreground transition-colors duration-300">
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8">
          <p role="alert" className="text-danger">
            {error}
          </p>

          <button
            onClick={loadProfile}
            className="mt-4 rounded-lg text-primary underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground transition-colors duration-300">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
        >
          <ArrowLeft size={18} />
          Back to feed
        </Link>

        <section className="mt-5 rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors duration-300 sm:p-8">
          <div className="flex flex-col items-center text-center">
            {profile?.photo ? (
              <img
                src={profile.photo}
                alt={profile.name || "Profile"}
                className="h-28 w-28 rounded-full border-4 border-accent object-cover"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-accent text-primary">
                <UserRound size={48} />
              </div>
            )}

            <h1 className="mt-4 text-2xl font-extrabold">
              {profile?.name || "Your Profile"}
            </h1>

            <p className="mt-1 text-sm text-muted">
              @{profile?.username || "user"}
            </p>

            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-accent hover:text-primary">
              <ImagePlus size={18} />
              {savingPhoto ? "Uploading..." : "Change profile photo"}

              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={savingPhoto}
                className="hidden"
              />
            </label>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-lg bg-danger/10 p-3 text-center text-sm text-danger"
            >
              {error}
            </p>
          )}

          {message && (
            <p className="mt-5 rounded-lg bg-success/10 p-3 text-center text-sm text-success">
              {message}
            </p>
          )}
        </section>

        <section className="mt-6">
          <div className="mb-4 flex gap-3 overflow-x-auto border-b border-border">
            <button
              type="button"
              onClick={() => setActiveTab("posts")}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === "posts"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              My Posts ({posts.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === "saved"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              Saved Posts
            </button>
          </div>

          {(() => {
            const visiblePosts =
              activeTab === "posts"
                ? posts
                : allPosts.filter(
                    (post) =>
                      post.bookmarked === true ||
                      post.isBookmarked === true ||
                      post.isSaved === true,
                  );

            if (visiblePosts.length === 0) {
              return (
                <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted transition-colors duration-300">
                  {activeTab === "posts"
                    ? "You haven't created any posts yet."
                    : "No saved posts found in the posts response."}
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {visiblePosts.map((post) => (
                  <article
                    key={post.id || post._id}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300"
                  >
                    {post.body && (
                      <p className="whitespace-pre-wrap wrap-break-words text-sm leading-7 text-foreground">
                        {post.body}
                      </p>
                    )}

                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post attachment"
                        loading="lazy"
                        className="mt-4 max-h-96 w-full rounded-xl bg-background object-contain"
                      />
                    )}
                  </article>
                ))}
              </div>
            );
          })()}
        </section>
      </div>
    </main>
  );
}
