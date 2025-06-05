import { useEffect, useState } from "react";
import axios from "axios";

type CommentType = {
  id: number;
  user_name: string;
  text: string;
  created_at: string;
  parent: number | null;
  replies: CommentType[];
};

export default function CommentThread({ projectId, taskId }: { projectId: string; taskId: string }) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [replyContent, setReplyContent] = useState<{ [id: number]: string }>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch comments
  const fetchComments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${taskId}/comments/`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setComments(res.data.results || res.data);
    } catch (e) {
      setError("Could not load comments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [projectId, taskId]);

  // Add new root comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
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

  // Add reply
  const handleAddReply = async (parentId: number, e: React.FormEvent) => {
    e.preventDefault();
    const replyText = replyContent[parentId];
    if (!replyText || !replyText.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${taskId}/comments/`,
        { text: replyText, parent: parentId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setReplyContent((prev) => ({ ...prev, [parentId]: "" }));
      setReplyingTo(null);
      fetchComments();
    } catch {
      setError("Failed to reply.");
    } finally {
      setSubmitting(false);
    }
  };

  // Render replies list
  function Replies({ replies }: { replies: CommentType[] }) {
    return (
      <div className="pl-5 border-l border-zinc-700 mt-2">
        {replies.map((reply) => (
          <div key={reply.id} className="mb-3">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 bg-blue-900 text-blue-200 rounded-full flex items-center justify-center font-bold text-base">
                {reply.user_name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <div className="flex gap-2 items-center">
                  <span className="font-semibold text-blue-200">{reply.user_name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(reply.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-white">{reply.text}</div>
                <button
                  className="text-xs text-blue-400 hover:underline mt-1"
                  onClick={() => setReplyingTo(reply.id)}
                >
                  Reply
                </button>
                {replyingTo === reply.id && (
                  <form
                    onSubmit={(e) => handleAddReply(reply.id, e)}
                    className="mt-2 flex flex-col gap-2"
                  >
                    <textarea
                      className="w-full rounded-xl p-2 bg-zinc-900 text-white border border-zinc-700 resize-none focus:ring-2 focus:ring-blue-500 ltr-force"
                      dir="ltr"
                      value={replyContent[reply.id] || ""}
                      onChange={(e) =>
                        setReplyContent((prev) => ({ ...prev, [reply.id]: e.target.value }))
                      }
                      placeholder="Write a reply..."
                      rows={2}
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-1 text-white rounded-xl font-bold disabled:opacity-60"
                        disabled={submitting || !(replyContent[reply.id] || "").trim()}
                      >
                        Reply
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="bg-zinc-700 px-3 py-1 rounded-xl text-white text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                {reply.replies && reply.replies.length > 0 && (
                  <Replies replies={reply.replies} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 mb-10">
      <div className="mb-4 text-xl font-bold text-white">Comments</div>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <div className="bg-zinc-900 rounded-xl p-4 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="text-gray-400 py-4">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-gray-500 py-4">No comments yet.</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="mb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-900 text-blue-200 flex items-center justify-center font-bold text-lg">
                  {comment.user_name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-200">{comment.user_name}</span>
                    <span className="ml-2 text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-white whitespace-pre-line">{comment.text}</div>
                  <button
                    className="text-xs text-blue-400 hover:underline mt-1"
                    onClick={() => setReplyingTo(comment.id)}
                  >
                    Reply
                  </button>
                  {replyingTo === comment.id && (
                    <form
                      onSubmit={(e) => handleAddReply(comment.id, e)}
                      className="mt-2 flex flex-col gap-2"
                    >
                      <textarea
                        className="w-full rounded-xl p-2 bg-zinc-900 text-white border border-zinc-700 resize-none focus:ring-2 focus:ring-blue-500 ltr-force"
                        dir="ltr"
                        value={replyContent[comment.id] || ""}
                        onChange={(e) =>
                          setReplyContent((prev) => ({ ...prev, [comment.id]: e.target.value }))
                        }
                        placeholder="Write a reply..."
                        rows={2}
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 px-4 py-1 text-white rounded-xl font-bold disabled:opacity-60"
                          disabled={submitting || !(replyContent[comment.id] || "").trim()}
                        >
                          Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="bg-zinc-700 px-3 py-1 rounded-xl text-white text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                  {comment.replies && comment.replies.length > 0 && (
                    <Replies replies={comment.replies} />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Add new comment form */}
      <form
        onSubmit={handleAddComment}
        className="bg-zinc-900 pt-4 pb-4 z-10 flex flex-col gap-2 mt-4 rounded-xl"
      >
        <textarea
          className="w-full rounded-xl p-3 bg-zinc-800 text-white border border-zinc-700 resize-none focus:ring-2 focus:ring-blue-500 ltr-force"
          dir="ltr"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
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
