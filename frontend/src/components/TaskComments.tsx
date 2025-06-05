// frontend/src/components/TaskComments.tsx

import { useEffect, useState } from "react";
import axios from "axios";

// Types match backend: user, email, text, parent, etc
export interface Comment {
  id: number;
  user: string;            // Name or username
  user_email: string;
  text: string;
  created_at: string;
  updated_at: string;
  parent: number | null;
  replies?: Comment[];     // For threading, built in FE
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

  // Replace with real auth context/user in prod
  const currentUserEmail = localStorage.getItem("user_email") || "";

  // 1. Fetch all comments for task (flat list), then nest them
  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${taskId}/comments/`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      const flat: Comment[] = res.data.results || res.data;
      setComments(nestComments(flat));
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

  // 2. Convert flat comment list to threaded tree
  function nestComments(flat: Comment[]): Comment[] {
    const idMap: { [id: number]: Comment & { replies: Comment[] } } = {};
    const roots: Comment[] = [];
    flat.forEach((c) => (idMap[c.id] = { ...c, replies: [] }));
    flat.forEach((c) => {
      if (c.parent && idMap[c.parent]) {
        idMap[c.parent].replies.push(idMap[c.id]);
      } else if (!c.parent) {
        roots.push(idMap[c.id]);
      }
    });
    return roots;
  }

  // 3. Add or reply comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
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

  // 5. Edit comment
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

  // 6. Render one comment (with replies, recursive)
  function CommentThread({ comment, level = 0 }: { comment: Comment; level?: number }) {
    return (
      <div className={`pl-${level * 5} mb-3`}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-900 text-blue-200 flex items-center justify-center font-bold text-lg">
            {comment.user?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-200">{comment.user || comment.user_email || "User"}</span>
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
              {comment.user_email === currentUserEmail && editingId !== comment.id && (
                <>
                  <button
                    className="text-xs text-green-400 hover:underline"
                    onClick={() => startEdit(comment)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs text-red-400 hover:underline"
                    onClick={() => handleDelete(comment.id)}
                  >
                    Delete
                  </button>
                </>
              )}
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
      {loading ? (
        <div className="text-gray-400 py-4">Loading comments...</div>
      ) : (
        <div>
          {comments.length === 0 && (
            <div className="text-gray-500 py-4">No comments yet.</div>
          )}
          {comments.map((comment) => (
            <CommentThread comment={comment} key={comment.id} />
          ))}
        </div>
      )}
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
