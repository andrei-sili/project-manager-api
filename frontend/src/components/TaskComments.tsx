// frontend/src/components/TaskComments.tsx

import { useEffect, useState } from "react";
import axios from "axios";

export interface Comment {
  id: number;
  user_name: string;       // name from backend
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
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Load user from localstorage if available
  const currentUserName = localStorage.getItem("user_name") || "";

  // 1. Fetch all comments for task, paginated
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

  // 2. Add or reply comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${taskId}/comments/`,
        { text: newComment, parent: replyTo },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setNewComment("");
      setReplyTo(null);
      fetchComments();
    } catch {
      setError("Failed to add comment.");
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Edit comment (not shown in backend, so only allow if you want, or remove)
  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.text);
  };
  const handleEditSave = async (commentId: number) => {
    if (!editContent.trim()) return;
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${taskId}/comments/${commentId}/`,
        { text: editContent },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setEditingId(null);
      setEditContent("");
      fetchComments();
    } catch {
      setError("Failed to update comment.");
    }
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  // 4. Delete comment
  const handleDelete = async (commentId: number) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${taskId}/comments/${commentId}/`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      fetchComments();
    } catch {
      setError("Failed to delete comment.");
    }
  };

  // 5. Render one comment and its replies
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
            {editingId === comment.id ? (
              <div>
                <textarea
                  className="w-full rounded p-2 bg-zinc-900 text-white border mt-2"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={2}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEditSave(comment.id)}
                    className="bg-green-700 hover:bg-green-800 px-3 py-1 text-white rounded text-xs"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-zinc-700 hover:bg-zinc-600 px-3 py-1 text-white rounded text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-white whitespace-pre-line">{comment.text}</div>
            )}
            <div className="flex gap-1 mt-1">
              <button
                className="text-xs text-blue-400 hover:underline"
                onClick={() => {
                  setReplyTo(comment.id);
                  setNewComment("");
                }}
              >
                Reply
              </button>
              {/* Show Edit/Delete only for current user's own comments if you have that info */}
              {/* {comment.user_name === currentUserName && editingId !== comment.id && ( ... )} */}
            </div>
            {replyTo === comment.id && (
              <form onSubmit={handleSubmit} className="mt-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full rounded-xl p-2 bg-zinc-800 text-white border border-zinc-700 resize-none focus:ring-2 focus:ring-blue-500 transition mb-2"
                  rows={2}
                  disabled={submitting}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-1 text-white rounded-xl font-bold disabled:opacity-60"
                    disabled={submitting || !newComment.trim()}
                  >
                    {submitting ? "Sending..." : "Reply"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyTo(null);
                      setNewComment("");
                    }}
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
      <div className="max-h-96 overflow-y-auto pr-2">
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
      {/* Form for new comment (not a reply) */}
      {replyTo === null && (
        <form onSubmit={handleSubmit} className="mt-4">
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
      )}
    </div>
  );
}
