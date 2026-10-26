import { useState } from "react";
import Swal from "sweetalert2";
import {
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  UserRound,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { apiRequest } from "../services/api";

export default function PostCard({
  post,
  currentUser,
  onPostUpdate,
  onPostDelete,
}) {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [busyCommentId, setBusyCommentId] = useState(null);
  const [busyAction, setBusyAction] = useState(false);
  const [error, setError] = useState("");
  const [showPostMenu, setShowPostMenu] = useState(false);
  const postId = post.id || post._id;
  const currentUserId = currentUser?._id || currentUser?.id;
  const [editingPost, setEditingPost] = useState(false);
  const [editBody, setEditBody] = useState(post.body || "");
  const [savingPost, setSavingPost] = useState(false);
  const [postError, setPostError] = useState("");

  const postOwnerId = post.user?._id || post.user?.id;

  const isPostOwner = Boolean(currentUserId) && postOwnerId === currentUserId;

  const isLiked = Array.isArray(post.likes)
    ? post.likes.some((like) => {
        const likeUserId =
          typeof like === "string"
            ? like
            : like?.user?._id || like?.user?.id || like?.userId || like?._id;

        return likeUserId === currentUserId;
      })
    : false;

  function updatePost(changes) {
    onPostUpdate(postId, changes);
  }

  async function handleLike() {
    if (busyAction) return;

    setBusyAction(true);
    setError("");

    try {
      const response = await apiRequest(`/posts/${postId}/like`, {
        method: "PUT",
      });

      // Some APIs return the updated post; others only return a message.
      const updatedPost = response?.data?.post || response?.data;

      if (
        updatedPost &&
        (updatedPost.id || updatedPost._id) === postId &&
        typeof updatedPost.likesCount === "number"
      ) {
        updatePost({
          ...updatedPost,
          id: updatedPost.id || updatedPost._id,
        });
      } else {
        // Reload the posts to get the authoritative like state and count.
        onPostUpdate(postId, { refresh: true });
      }
    } catch (err) {
      setError(err.message || "Could not update like.");
    } finally {
      setBusyAction(false);
    }
  }

  async function loadComments() {
    setLoadingComments(true);
    setError("");

    try {
      const response = await apiRequest(
        `/posts/${postId}/comments?page=1&limit=10`,
      );

      const result =
        response?.data?.comments || response?.data?.docs || response?.data;

      setComments(Array.isArray(result) ? result : []);
      setCommentsLoaded(true);
    } catch (err) {
      setError(err.message || "Could not load comments.");
    } finally {
      setLoadingComments(false);
    }
  }

  async function toggleComments() {
    const nextState = !showComments;
    setShowComments(nextState);

    if (nextState && !commentsLoaded) {
      await loadComments();
    }
  }

  async function handleAddComment(event) {
    event.preventDefault();

    const content = commentText.trim();
    if (!content || submittingComment) return;

    setSubmittingComment(true);
    setError("");

    try {
      const response = await apiRequest(`/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });

      const result = response?.data?.comment || response?.data;

      if (!response?.success || !result) {
        throw new Error(response?.message || "Could not add comment.");
      }

      setCommentText("");
      await loadComments();
      updatePost({ commentsCount: (post.commentsCount || 0) + 1 });
    } catch (err) {
      setError(err.message || "Could not add comment.");
    } finally {
      setSubmittingComment(false);
    }
  }

  function getCommentId(comment) {
    return comment.id || comment._id;
  }

  function getCommentOwnerId(comment) {
    return (
      comment.user?._id ||
      comment.user?.id ||
      comment.commentCreator?._id ||
      comment.commentCreator?.id ||
      comment.owner?._id ||
      comment.owner?.id ||
      comment.userId
    );
  }

  function getCommentText(comment) {
    return comment.content || comment.body || comment.text || "";
  }

  function canManageComment(comment) {
    return currentUserId && getCommentOwnerId(comment) === currentUserId;
  }

  async function handleSaveEdit(commentId) {
    const content = editText.trim();
    if (!content || busyCommentId) return;

    setBusyCommentId(commentId);
    setError("");

    try {
      await apiRequest(`/posts/${postId}/comments/${commentId}`, {
        method: "PUT",
        body: JSON.stringify({ content }),
      });

      setEditingId(null);
      setEditText("");
      await loadComments();
    } catch (err) {
      setError(err.message || "Could not edit comment.");
    } finally {
      setBusyCommentId(null);
    }
  }

  async function handleDeleteComment(commentId) {
    if (busyCommentId) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this comment!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setBusyCommentId(commentId);
    setError("");

    try {
      await apiRequest(`/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
      });

      setComments((previous) =>
        previous.filter((comment) => getCommentId(comment) !== commentId),
      );

      updatePost({
        commentsCount: Math.max((post.commentsCount || 0) - 1, 0),
      });

      await Swal.fire({
        title: "Deleted!",
        text: "Your comment has been deleted.",
        icon: "success",
        confirmButtonColor: "#7c3aed",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({
        title: "Error!",
        text: err.message || "Could not delete comment.",
        icon: "error",
        confirmButtonColor: "#7c3aed",
      });
    } finally {
      setBusyCommentId(null);
    }
  }

  async function handleBookmark() {
    setBusyAction(true);
    setError("");

    try {
      await apiRequest(`/posts/${postId}/bookmark`, {
        method: "PUT",
      });

      updatePost({ bookmarked: !post.bookmarked });
    } catch (err) {
      setError(err.message || "Could not save post.");
    } finally {
      setBusyAction(false);
    }
  }

  async function handleUpdatePost(event) {
    event.preventDefault();

    if (!editBody.trim() || savingPost) return;

    setSavingPost(true);
    setPostError("");

    try {
      const response = await apiRequest(`/posts/${postId}`, {
        method: "PUT",
        body: JSON.stringify({ body: editBody.trim() }),
      });

      const updatedPost = response?.data?.post || response?.data;

      const updatedUser =
        updatedPost?.user && typeof updatedPost.user === "object"
          ? updatedPost.user
          : post.user;

      updatePost({
        ...(updatedPost && (updatedPost.id || updatedPost._id) === postId
          ? updatedPost
          : {}),
        id: postId,
        body: editBody.trim(),
        user: updatedUser,
      });

      setEditingPost(false);
    } catch (err) {
      setPostError(err.message || "Could not update post.");
    } finally {
      setSavingPost(false);
    }
  }

  async function handleDeletePost() {
    if (busyAction) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this post!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setBusyAction(true);
    setError("");

    try {
      await apiRequest(`/posts/${postId}`, {
        method: "DELETE",
      });

      onPostDelete?.(postId);

      await Swal.fire({
        title: "Deleted!",
        text: "Your post has been deleted.",
        icon: "success",
        confirmButtonColor: "#7c3aed",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({
        title: "Error!",
        text: err.message || "Could not delete post.",
        icon: "error",
        confirmButtonColor: "#7c3aed",
      });
    } finally {
      setBusyAction(false);
    }
  }

  const dateLabel = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-3">
          {post.user?.photo ? (
            <img
              src={post.user.photo}
              alt=""
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-primary">
              <UserRound size={22} />
            </div>
          )}

          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold">
              {post.user?.name || "Vibely User"}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              @{post.user?.username || "user"} · {dateLabel}
            </p>
          </div>
        </div>

        <div className="relative flex shrink-0 items-center gap-1">
          {isPostOwner && !editingPost && (
            <button
              type="button"
              title="Edit post"
              onClick={() => {
                setEditBody(post.body || "");
                setEditingPost(true);
                setShowPostMenu(false);
              }}
              className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary"
            >
              <Pencil size={18} />
            </button>
          )}

          <button
            type="button"
            aria-label="More options"
            aria-expanded={showPostMenu}
            onClick={() => setShowPostMenu((previous) => !previous)}
            className="rounded-full p-2 text-muted hover:bg-accent"
          >
            <MoreHorizontal size={21} />
          </button>

          {showPostMenu && (
            <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-xl border border-border bg-card p-2 shadow-lg">
              {isPostOwner && (
                <button
                  type="button"
                  onClick={() => {
                    setEditBody(post.body || "");
                    setEditingPost(true);
                    setShowPostMenu(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  Edit post
                </button>
              )}
              {isPostOwner && (
                <button
                  type="button"
                  disabled={busyAction}
                  onClick={() => {
                    setShowPostMenu(false);
                    handleDeletePost();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Delete post
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowPostMenu(false);
                  handleBookmark();
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
              >
                {post.bookmarked ? "Remove from saved" : "Save post"}
              </button>
            </div>
          )}
        </div>
      </div>

      {editingPost ? (
        <form onSubmit={handleUpdatePost} className="px-4 pb-4">
          <textarea
            value={editBody}
            onChange={(event) => setEditBody(event.target.value)}
            rows={4}
            maxLength={5000}
            className="w-full rounded-xl border border-border p-3 text-sm outline-none focus:border-primary"
          />

          {postError && <p className="mt-2 text-sm text-danger">{postError}</p>}

          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={savingPost || !editBody.trim()}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              <Check size={16} />
              {savingPost ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={() => {
                setEditBody(post.body || "");
                setEditingPost(false);
              }}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:opacity-80"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </form>
      ) : (
        post.body && (
          <p className="whitespace-pre-wrap wrap-break-words px-4 pb-4 text-sm leading-7 text-foreground">
            {post.body}
          </p>
        )
      )}

      {post.image && (
        <img
          src={post.image}
          alt="Post attachment"
          loading="lazy"
          className="max-h-130 w-full bg-accent object-contain"
        />
      )}

      <div className="flex justify-between px-4 py-3 text-xs text-muted">
        <span>{post.likesCount || 0} likes</span>
        <span>{post.commentsCount || 0} comments</span>
      </div>

      <div className="mx-4 border-t border-border" />

      <div className="grid grid-cols-3 gap-1 p-2">
        <button
          type="button"
          disabled={busyAction}
          onClick={handleLike}
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium hover:bg-accent disabled:opacity-50 ${
            isLiked ? "text-primary" : "text-muted"
          }`}
        >
          <Heart size={19} fill={isLiked ? "currentColor" : "none"} />
          Like
        </button>

        <button
          type="button"
          onClick={toggleComments}
          className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-muted hover:bg-accent hover:text-primary"
        >
          <MessageCircle size={19} />
          Comment
        </button>

        <button
          type="button"
          disabled={busyAction}
          onClick={handleBookmark}
          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium hover:bg-accent disabled:opacity-50 ${
            post.bookmarked ? "text-primary" : "text-muted"
          }`}
        >
          <Bookmark
            size={19}
            fill={post.bookmarked ? "currentColor" : "none"}
          />
          Save
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mx-4 mb-3 rounded-lg bg-danger/10 p-3 text-sm text-danger"
        >
          {error}
        </p>
      )}

      {showComments && (
        <section className="border-t border-border bg-background p-4">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Write a comment..."
              maxLength={1000}
              className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary"
            />

            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {submittingComment ? "Sending..." : "Send"}
            </button>
          </form>

          {loadingComments && (
            <p className="py-5 text-center text-sm text-muted">
              Loading comments...
            </p>
          )}

          {!loadingComments && commentsLoaded && comments.length === 0 && (
            <p className="py-5 text-center text-sm text-muted">
              No comments yet. Be the first to comment!
            </p>
          )}

          <div className="mt-4 space-y-3">
            {comments.map((comment) => {
              const commentId = getCommentId(comment);
              const owner =
                comment.user || comment.commentCreator || comment.owner;

              return (
                <div
                  key={commentId}
                  className="rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2">
                      {owner?.photo ? (
                        <img
                          src={owner.photo}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-muted">
                          <UserRound size={18} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">
                          {owner?.name || "User"}
                        </p>

                        {editingId === commentId ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              value={editText}
                              onChange={(event) =>
                                setEditText(event.target.value)
                              }
                              maxLength={1000}
                              rows={3}
                              className="w-full rounded-lg border border-border p-2 text-sm outline-none focus:border-primary"
                            />

                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={busyCommentId === commentId}
                                onClick={() => handleSaveEdit(commentId)}
                                className="flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                              >
                                <Check size={14} />
                                Save
                              </button>

                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:opacity-80"
                              >
                                <X size={14} />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-1 whitespace-pre-wrap wrap-break-words text-sm leading-6 text-muted">
                            {getCommentText(comment)}
                          </p>
                        )}
                      </div>
                    </div>

                    {canManageComment(comment) && editingId !== commentId && (
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          title="Edit comment"
                          onClick={() => {
                            setEditingId(commentId);
                            setEditText(getCommentText(comment));
                          }}
                          className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          title="Delete comment"
                          disabled={busyCommentId === commentId}
                          onClick={() => handleDeleteComment(commentId)}
                          className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}
