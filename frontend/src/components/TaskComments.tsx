import { useEffect, useState } from "react";
import axios from "axios";

export interface Comment {
  id: number;
  user_name: string;
  text: string;
  created_at: string;
  replies: Comment[];
}

interface TaskCommentsProps {
  projectId: string;
  taskId: string;
}

export default function TaskComments({ projectId, taskId }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyInputs, setReplyInputs] = useState<{ [key: number]: string }>({});
  const [replySubmitting, setReplySubmitting] = useState<{ [key: number]: boolean }>({});
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // User for edit/delete (if needed)
  const currentUserName = localStorage.getItem("user_name") || "";

  // Fetch comments paginated, tree structure
  const fetchComments = async (url?: string, append = false) => {
    setLoading(true);
    try {
      const res = await axios.get(
        url || `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${taskId}/comments/`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      const page = res.data;
      setNextPage(page.next);
      setHasMore(!!page.next);
      setComments((prev) =>
        append ? [...prev, ...(page.results as Comment[])] : (page.results as Comment[])
      );
      setError("");
    } catch {
      setError("Could not load comments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [projectId, taskId]);

  // Add comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${taskId}/comments/`,
        { text: newComment, parent: null },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setNewComment("");
      fetchComments();
    } catch {
      setError("Failed to add comment.");
    } finally {
      setSubmitting(false);
    }
  };

  // Reply comment
  const handleReplySubmit = async (commentId: number, e: React.FormEvent) => {
    e.preventDefault();
    const value = replyInputs[commentId] || "";
    if (!value.trim() || replySubmitting[commentId]) return;
    setReplySubmitting((prev) => ({ ...prev, [commentId]: true }));
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${taskId}/comments/`,
        { text: value, parent: commentId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
      setReplyTo(null);
      fetchComments();
    } catch {
      setError("Failed to add reply.");
    } finally {
      setReplySubmitting((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  // Render one comment and its replies
  function CommentThread({ comment, level = 0 }: { comment: Comment; level?: number }) {
    return (
      <div className={`mb-3 pl-${Math.min(level * 5, 20)}`}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-900 text-blue-200 flex items-center justify-center font-bold text-lg">
            {comment.user_name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-200">{comment.user_name || "User"}</span>
              <span className="ml-2 text-xs text-gray-400">
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </div>
            <div className="text-white whitespace-pre-line">{comment.text}</div>
            <div className="flex gap-1 mt-1">
              <button
                className="text-xs text-blue-400 hover:underline"
                onClick={() => setReplyTo(comment.id)}
              >
                Reply
              </button>
            </div>
            {replyTo === comment.id && (
              <form
                onSubmit={(e) => handleReplySubmit(comment.id, e)}
                className="mt-2 flex flex-col gap-2"
              >
                <textarea
                  dir="ltr" // fix: force left-to-right writing for reply
                  value={replyInputs[comment.id] || ""}
                  onChange={(e) =>
                    setReplyInputs((prev) => ({
                      ...prev,
                      [comment.id]: e.target.value,
                    }))
                  }
                  placeholder="Write a reply..."
                  className="w-full rounded-xl p-2 bg-zinc-800 text-white border border-zinc-700 resize-none focus:ring-2 focus:ring-blue-500 transition mb-2"
                  rows={2}
                  disabled={replySubmitting[comment.id]}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-1 text-white rounded-xl font-bold disabled:opacity-60"
                    disabled={replySubmitting[comment.id] || !(replyInputs[comment.id] || "").trim()}
                  >
                    {replySubmitting[comment.id] ? "Sending..." : "Reply"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="bg-zinc-700 px-3 py-1 rounded-xl text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            {/* Render replies recursively */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-2 border-l border-zinc-700 pl-4">
                {comment.replies.map((reply) => (
                  <CommentThread comment={reply} key={reply.id} level={(level || 0) + 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 mb-10">
      <div className="mb-4 text-xl font-bold text-white">Comments</div>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <div className="max-h-96 overflow-y-auto pr-2 bg-zinc-900 rounded-xl">
        {loading ? (
          <div className="text-gray-400 py-4">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-gray-500 py-4">No comments yet.</div>
        ) : (
          <div>
            {comments.map((comment) => (
              <CommentThread comment={comment} key={comment.id} />
            ))}
            {hasMore && (
              <div className="flex justify-center mt-4">
                <button
                  className="bg-zinc-800 border border-zinc-600 px-4 py-2 text-white rounded-lg"
                  onClick={() => fetchComments(nextPage!, true)}
                  disabled={loading}
                >
                  Load more
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Sticky form for new comment */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 left-0 bg-zinc-900 pt-4 pb-4 z-10 flex flex-col gap-2"
        style={{ position: "sticky", bottom: 0, left: 0, background: "#18181b" }}
      >
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full rounded-xl p-3 bg-zinc-800 text-white border border-zinc-700 resize-none focus:ring-2 focus:ring-blue-500 transition mb-2"
          rows={2}
          disabled={submitting}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 text-white rounded-xl font-bold disabled:opacity-60"
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
