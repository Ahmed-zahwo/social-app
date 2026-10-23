
import { useRef, useState } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import { apiRequest } from "../services/api";

export default function CreatePost({ user, onCreated }) {
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  }

  function removeImage() {
    if (preview) URL.revokeObjectURL(preview);

    setImage(null);
    setPreview("");

    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!body.trim() && !image) {
      setError("Write something or choose an image.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      if (body.trim()) formData.append("body", body.trim());
      if (image) formData.append("image", image);

      const response = await apiRequest("/posts", {
        method: "POST",
        body: formData,
      });

      const createdPost =
        response?.data?.post ||
        (response?.data?.posts && response.data.posts[0]) ||
        response?.data;

      setBody("");
      removeImage();

      if (createdPost?.id || createdPost?._id) {
        onCreated(createdPost);
      } else {
        onCreated(null);
      }
    } catch (err) {
      setError(err.message || "Could not create post.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-5 rounded-2xl border border-border bg-card p-4 text-foreground shadow-sm transition-colors duration-300"
    >
      <div className="flex items-start gap-3">
        {user?.photo ? (
          <img
            src={user.photo}
            alt=""
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-primary">
            {user?.name?.charAt(0) || "V"}
          </div>
        )}

        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={`What's on your mind, ${user?.name || "there"}?`}
          rows={3}
          maxLength={5000}
          className="min-w-0 flex-1 resize-y rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {preview && (
        <div className="relative mt-4">
          <img
            src={preview}
            alt="Selected image preview"
            className="max-h-72 w-full rounded-xl object-contain"
          />

          <button
            type="button"
            onClick={removeImage}
            aria-label="Remove image"
            className="absolute right-2 top-2 rounded-full bg-card p-2 text-foreground shadow-md hover:bg-accent"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-danger/10 p-3 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-accent hover:text-primary"
        >
          <ImagePlus size={19} />
          Photo
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          type="submit"
          disabled={loading || (!body.trim() && !image)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={16} />
          {loading ? "Publishing..." : "Publish"}
        </button>
      </div>
    </form>
  );
}
