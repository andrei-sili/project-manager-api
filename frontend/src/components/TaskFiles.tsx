// frontend/src/components/TaskFiles.tsx

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Paperclip, X } from "lucide-react";

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

export default function TaskFiles({
  projectId,
  taskId,
  compact = false,
  onFilesUpdated,
}: TaskFilesProps) {
  const [files, setFiles] = useState<TaskFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${taskId}/files/`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        }
      );
      setFiles(res.data.results || res.data);
      setError("");
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", fileToUpload);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${taskId}/files/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setFileToUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchFiles();
      if (onFilesUpdated) onFilesUpdated(); // Call refresh if provided
    } catch (err: any) {
      if (err?.response?.data?.file) {
        setError(err.response.data.file[0]);
      } else {
        setError("Failed to upload file.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: number) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${taskId}/files/${fileId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
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
          className="inline-flex items-center px-2 py-1 bg-zinc-800 text-blue-300 rounded-md cursor-pointer hover:bg-zinc-700 transition text-xs font-semibold gap-1"
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
          className={`bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-white text-xs font-semibold disabled:opacity-60`}
          disabled={uploading || !fileToUpload}
        >
          {uploading ? "..." : "Upload"}
        </button>
      </form>
      <div className={`bg-zinc-900 ${compact ? "rounded-md p-2" : "rounded-xl p-4"} ${compact ? "max-h-28" : "max-h-[300px]"} overflow-y-auto`}>
        {loading ? (
          <div className="text-gray-400 py-2">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="text-gray-500 py-2">No files attached.</div>
        ) : (
          <ul className="space-y-1">
            {files.map((f: TaskFile) => {
              const fileName = getFileName(f);
              const isImage = /\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(fileName);
              const url = f.file_url;
              return (
                <li key={f.id} className="flex items-center justify-between bg-zinc-800 p-2 rounded">
                  <div className="flex items-center gap-2 min-w-0">
                    {isImage ? (
                      <img
                        src={url}
                        alt={fileName}
                        className="w-8 h-8 object-cover rounded shadow border border-zinc-700 cursor-pointer"
                        style={{ minWidth: 32, minHeight: 32, maxWidth: 32, maxHeight: 32 }}
                        onClick={() => window.open(url, "_blank")}
                        title="Preview"
                      />
                    ) : (
                      <Paperclip size={15} className="text-blue-300 shrink-0" />
                    )}
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 font-semibold hover:underline text-xs truncate"
                      download={fileName}
                    >
                      {fileName}
                    </a>
                    <span className="ml-2 text-xs text-gray-400 truncate">
                      by {f.uploaded_by}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/tasks/${taskId}/files/${f.id}/download/`}
                        className="text-xs bg-zinc-700 hover:bg-blue-700 text-white px-2 py-0.5 rounded"
                        style={{fontSize: "10px"}}
                        title="Download"
                    >
                      Download
                    </a>

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
