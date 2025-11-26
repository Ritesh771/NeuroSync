"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResumeUploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      // Check file type
      if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(selectedFile.type)) {
        setError("Only PDF and DOCX files are allowed");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Starting upload for file:", file.name, "size:", file.size);
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Upload response status:", response.status);
      const responseText = await response.text();
      console.log("Upload response text:", responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log("Upload successful:", data);
        alert(`Upload successful! Extracted data: ${JSON.stringify(data.extractedData, null, 2)}`);
        router.push("/dashboard");
      } else {
        try {
          const data = JSON.parse(responseText);
          console.log("Upload failed:", data);
          setError(data.error || "Upload failed");
        } catch (e) {
          console.log("Failed to parse error response:", responseText);
          setError("Upload failed - check console for details");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Upload Your Resume</h1>
        <p className="mb-4 text-gray-600">
          Upload your resume (PDF or DOCX, max 5MB) to get started with personalized interviews.
        </p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Resume File</label>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-blue-600 text-white py-2"
            disabled={loading || !file}
          >
            {loading ? "Uploading..." : "Upload Resume"}
          </button>
        </form>
      </div>
    </main>
  );
}