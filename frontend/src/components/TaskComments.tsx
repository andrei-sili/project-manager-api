// frontend/src/components/TaskComments.tsx

import { useEffect, useState } from "react";
import axios from "axios";

interface Comment {
  id: number;
  user: string;
  user_email: string;
  text: string;
  created_at: string;
  updated_at: string;
}

interface TaskCommentsProps {
  projectId: string;
  taskId: string;
}

export default function TaskComments({ projectId, taskId }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  // Fetch comments from the backend
  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${taskId}/comments/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      setComments(res.data.results || res.data); // handle paginated or array response
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

  // Add new comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${taskId}/comments/`,
        { text: newComment, parent: null },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      setNewComment("");
      fetchComments();
    } catch {
      setError("Failed to add comment.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const handleDelete = async (commentId: number) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${taskId}/comments/${commentId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      fetchComments();
    } catch {
      setError("Failed to delete comment.");
    }
  };

  // Start editing comment
  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.text);
  };

  // Save edit
  const handleEditSave = async (commentId: number) => {
    if (!editContent.trim()) return;
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${taskId}/comments/${commentId}/`,
        { text: editContent },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      setEditingId(null);
      setEditContent("");
      fetchComments();
    } catch {
      setError("Failed to update comment.");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  // You can replace this with your real auth context
  const currentUserEmail = localStorage.getItem("user_email") || "";

  return (
    <div className="w-full flex flex-col max-w-3xl mx-auto mb-8">
      <div className="flex-1 overflow-y-auto mb-4">
        {loading ? (
          <div className="text-gray-400 py-4">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-gray-500 py-4">No comments yet.</div>
        ) : (
          <ul className="space-y-4">
            {comments.map((c) => (
              <li key={c.id} className="bg-zinc-800 rounded-xl p-4 relative group">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-blue-900 text-blue-200 flex items-center justify-center font-bold">
                    {c.user?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <span className="font-semibold text-blue-200">{c.user || "User"}</span>
                    <span className="ml-2 text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                {editingId === c.id ? (
                  <div>
                    <textarea
                      className="w-full rounded p-2 bg-zinc-900 text-white border mt-2"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEditSave(c.id)}
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
                  <div className="text-white whitespace-pre-line">{c.text}</div>
                )}
                {c.user_email === currentUserEmail && editingId !== c.id && (
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      className="text-xs bg-zinc-700 hover:bg-blue-700 text-white px-2 py-1 rounded"
                      onClick={() => startEdit(c)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-xs bg-zinc-700 hover:bg-red-700 text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(c.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <form onSubmit={handleSubmit} className="w-full">
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
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </form>
    </div>
  );
}
