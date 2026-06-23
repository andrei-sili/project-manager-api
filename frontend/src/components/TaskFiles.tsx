"use client";
import { useEffect, useRef, useState } from "react";
import axiosClient from "@/lib/axiosClient";
import { Paperclip, X } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";

interface TaskFile {
  id: number;
  file: string;
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
}

interface TaskFilesProps {
  projectId: string;
  taskId: string;
  compact?: boolean;
  onFilesUpdated?: () => void; // Optional refresh callback for parent
}

const getFileName = (f: TaskFile) =>
  f.file.split('/').pop() || "file";

const isImageName = (name: string) => /\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(name);

export default function TaskFiles({
  projectId,
  taskId,
  compact = false,
  onFilesUpdated,
}: TaskFilesProps) {
  const [files, setFiles] = useState<TaskFile[]>([]);
  const [previews, setPreviews] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewsRef = useRef<Record<number, string>>({});
  previewsRef.current = previews;

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(
        `/projects/${projectId}/tasks/${taskId}/files/`
      );
      const list: TaskFile[] = res.data.results || res.data;
      setFiles(list);
      setError("");

      // Build authenticated object-URL previews for images so we never depend
      // on a publicly served /media/ path.
      const pairs = await Promise.all(
        list
          .filter((f) => isImageName(getFileName(f)))
          .map(async (f) => {
            try {
              const r = await axiosClient.get(
                `/projects/${projectId}/tasks/${taskId}/files/${f.id}/download/`,
                { responseType: "blob" }
              );
              return [f.id, URL.createObjectURL(r.data)] as const;
            } catch {
              return null;
            }
          })
      );
      setPreviews((prev) => {
        Object.values(prev).forEach((u) => URL.revokeObjectURL(u));
        return Object.fromEntries(pairs.filter(Boolean) as [number, string][]);
      });
    } catch {
      setError("Could not load files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line
  }, [projectId, taskId]);

  // Revoke any outstanding object URLs on unmount.
  useEffect(() => () => {
    Object.values(previewsRef.current).forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", fileToUpload);
    try {
      await axiosClient.post(
        `/projects/${projectId}/tasks/${taskId}/files/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setFileToUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchFiles();
      if (onFilesUpdated) onFilesUpdated(); // Call refresh if provided
    } catch (err) {
      setError(getErrorMessage(err, "Failed to upload file."));
    } finally {
      setUploading(false);
    }
  };

  // The download endpoint is authenticated, so fetch it as a blob (carrying the
  // bearer token via axiosClient) rather than navigating to a bare URL.
  const handleDownload = async (f: TaskFile) => {
    try {
      const res = await axiosClient.get(
        `/projects/${projectId}/tasks/${taskId}/files/${f.id}/download/`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = getFileName(f);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download file.");
    }
  };

  const handleDelete = async (fileId: number) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await axiosClient.delete(
        `/projects/${projectId}/tasks/${taskId}/files/${fileId}/`
      );
      fetchFiles();
      if (onFilesUpdated) onFilesUpdated(); // Call refresh if provided
    } catch {
      setError("Failed to delete file.");
    }
  };

  return (
    <div className={compact ? "mb-4" : "w-full max-w-3xl mx-auto mt-8 mb-10"}>
      <div className={compact ? "mb-2 text-base font-semibold text-white" : "mb-4 text-xl font-bold text-white"}>
        Files
      </div>
      {error && <div className="text-red-500 text-sm mb-1">{error}</div>}
      <form
        onSubmit={handleUpload}
        className={`mb-2 flex gap-2 items-center ${compact ? "" : "mt-2"}`}
        encType="multipart/form-data"
      >
        {/* Hidden input + custom label */}
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-2 py-1 bg-zinc-800 text-emerald-300 rounded-md cursor-pointer hover:bg-zinc-700 transition text-xs font-semibold gap-1"
        >
          <Paperclip size={14} />
          {fileToUpload ? "Change" : "Attach"}
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            className="hidden"
            onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
            disabled={uploading}
          />
        </label>
        {fileToUpload && (
          <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded text-xs text-white max-w-[130px] truncate">
            <Paperclip size={12} />
            <span className="truncate">{fileToUpload.name}</span>
            <button
              type="button"
              onClick={() => {
                setFileToUpload(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="hover:text-red-400 ml-1"
              title="Remove"
            >
              <X size={13} />
            </button>
          </div>
        )}
        <button
          type="submit"
          className={`bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded-lg text-white text-xs font-semibold disabled:opacity-60`}
          disabled={uploading || !fileToUpload}
        >
          {uploading ? "..." : "Upload"}
        </button>
      </form>
      <div className={`bg-zinc-900 ${compact ? "rounded-md p-2" : "rounded-xl p-4"} ${compact ? "max-h-28" : "max-h-[300px]"} overflow-y-auto`}>
        {loading ? (
          <div className="text-gray-400 py-2">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="text-gray-400 py-2">No files attached.</div>
        ) : (
          <ul className="space-y-1">
            {files.map((f: TaskFile) => {
              const fileName = getFileName(f);
              const preview = previews[f.id];
              return (
                <li key={f.id} className="flex items-center justify-between bg-zinc-800 p-2 rounded">
                  <div className="flex items-center gap-2 min-w-0">
                    {preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={preview}
                        alt={fileName}
                        className="w-8 h-8 object-cover rounded shadow border border-zinc-700 cursor-pointer"
                        style={{ minWidth: 32, minHeight: 32, maxWidth: 32, maxHeight: 32 }}
                        onClick={() => handleDownload(f)}
                        title="Download"
                      />
                    ) : (
                      <Paperclip size={15} className="text-emerald-300 shrink-0" />
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownload(f)}
                      className="text-emerald-300 font-semibold hover:underline text-xs truncate"
                    >
                      {fileName}
                    </button>
                    <span className="ml-2 text-xs text-gray-400 truncate">
                      by {f.uploaded_by}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={() => handleDownload(f)}
                        className="text-xs bg-zinc-700 hover:bg-emerald-700 text-white px-2 py-0.5 rounded text-[10px]"
                        title="Download"
                    >
                      Download
                    </button>

                    <button
                        className="text-xs bg-zinc-700 hover:bg-red-700 text-white px-2 py-0.5 rounded"
                        onClick={() => handleDelete(f.id)}
                        style={{fontSize: "10px"}}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
