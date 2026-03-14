// src/pages/UploadPDF.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UploadPDF() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      await axios.post("http://127.0.0.1:8000/upload-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      localStorage.setItem("uploadedFileName", file.name);
      // 🔥 CLEAR OLD SUMMARY + Q&A (NEW PDF = NEW SESSION)
      
      localStorage.removeItem("currentSummary");
      localStorage.removeItem("currentQA");
      localStorage.removeItem("currentFlashcards");
      localStorage.removeItem("currentMCQs");
      localStorage.removeItem("currentConceptNodes");
      localStorage.removeItem("currentConceptEdges");
      alert("PDF uploaded successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
      <div className="bg-[#1e293b] border border-[#334155] p-8 rounded-xl shadow-xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-100 mb-6">
          📄 Upload PDF
        </h2>

        <label className="block mb-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />
          <div className="cursor-pointer bg-[#0f172a] border border-[#334155] text-gray-300 px-4 py-3 rounded-lg hover:bg-[#020617] transition">
            {file ? file.name : "Choose a PDF file"}
          </div>
        </label>

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload PDF"}
        </button>

        {loading && (
          <p className="text-sm text-gray-400 mt-4">
            Processing your document, please wait...
          </p>
        )}
      </div>
    </div>
  );
}
