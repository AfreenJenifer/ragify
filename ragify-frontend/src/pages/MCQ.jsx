// src/pages/MCQ.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function MCQ() {
  const [count, setCount] = useState(5);
  const [mcqs, setMcqs] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- LOAD FROM LOCAL STORAGE ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem("currentMCQs");
    if (saved) {
      setMcqs(JSON.parse(saved));
    }
    setHydrated(true);
  }, []);

  /* ---------------- SAVE TO LOCAL STORAGE ---------------- */
  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(
      "currentMCQs",
      JSON.stringify(mcqs)
    );
  }, [mcqs, hydrated]);

  /* ---------------- GENERATE MCQs ---------------- */
  const generateMCQs = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/generate-mcq",
        { count: Number(count) }
      );

      /**
       * If your backend returns RAW text,
       * store it as-is. If structured JSON,
       * replace this with parsed output.
       */
      setMcqs(res.data.mcqs);

    } catch (err) {
      console.error(err);
      setError("Failed to generate MCQs. Upload a PDF first.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- HYDRATION BLOCK ---------------- */
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-gray-400">
        Restoring MCQs…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-6">
      <div className="max-w-4xl mx-auto bg-[#1e293b] border border-[#334155] rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-100">
          ❓ MCQs
        </h1>

        <div className="flex gap-4 mb-4">
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            min="1"
            max="100"
            className="bg-[#020617] border border-[#334155] text-gray-200 px-3 py-2 rounded w-32"
          />

          <button
            onClick={generateMCQs}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate MCQs"}
          </button>
        </div>

        {error && (
          <p className="text-red-400 mt-2">
            {error}
          </p>
        )}

        {/* ---------------- MCQ DISPLAY ---------------- */}
        {/* ------------ MCQ DISPLAY (PRETTY) ------------ */}
<div className="mt-6 space-y-6">
  {Array.isArray(mcqs) &&
    mcqs.map((q, i) => (
      <div
        key={i}
        className="bg-[#020617] border border-[#334155] rounded-xl p-6 shadow"
      >
        {/* Question */}
        <p className="text-indigo-400 font-semibold mb-4">
          Q{i + 1}. {q.question}
        </p>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {q.options.map((opt, idx) => {
            const label = String.fromCharCode(65 + idx); // A B C D
            const isCorrect = opt === q.answer;

            return (
              <div
                key={idx}
                className={`flex gap-3 px-4 py-2 rounded-lg border
                  ${
                    isCorrect
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                      : "border-[#334155] bg-[#020617] text-gray-300"
                  }`}
              >
                <span className="font-bold">{label}.</span>
                <span>{opt}</span>
              </div>
            );
          })}
        </div>

        {/* Correct Answer */}
        <p className="mt-4 text-sm text-emerald-400 font-semibold">
          ✅ Correct Answer: {q.answer}
        </p>
      </div>
    ))}
</div>

        {!mcqs && !loading && !error && (
          <p className="text-gray-400 mt-6 text-sm">
            Generate MCQs from your uploaded PDF.
          </p>
        )}
      </div>
    </div>
  );
}