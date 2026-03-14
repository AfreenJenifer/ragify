// src/pages/Flashcards.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function Flashcards() {
  const [count, setCount] = useState(10);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  /* ---------------- LOAD FROM LOCAL STORAGE ---------------- */
  useEffect(() => {
  const saved = localStorage.getItem("currentFlashcards");
  if (saved) {
    setFlashcards(JSON.parse(saved));
  }
  setHydrated(true);
}, []);

  /* ---------------- SAVE TO LOCAL STORAGE ---------------- */
  useEffect(() => {
  if (!hydrated) return;   // 🔥 CRITICAL LINE

  localStorage.setItem(
    "currentFlashcards",
    JSON.stringify(flashcards)
  );
}, [flashcards, hydrated]);
 
  /* ---------------- GENERATE FLASHCARDS ---------------- */
  const generateFlashcards = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/generate-flashcards",
        { num_cards: Number(count) }
      );

      // ✅ ONLY update state (localStorage handled by useEffect)
      setFlashcards(res.data.flashcards || []);

    } catch (err) {
      console.error(err);
      setError("Failed to generate flashcards. Upload a PDF first.");
    } finally {
      setLoading(false);
    }
  };
  if (!hydrated) {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-gray-400">
      Restoring flashcards…
    </div>
  );
}
  return (
    <div className="min-h-screen bg-[#0f172a] p-6">
      <div className="max-w-4xl mx-auto bg-[#1e293b] border border-[#334155] rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-extrabold mb-6 text-white flex items-center gap-2">
  🧠 Flashcards
  <span className="text-sm bg-indigo-600/20 text-indigo-300 px-3 py-1 rounded-full">
    Active
  </span>
</h1>

        <div className="flex items-center gap-4 mb-6">
  <input
    type="number"
    value={count}
    onChange={(e) => setCount(e.target.value)}
    min="1"
    max="100"
    className="bg-[#020617] border border-[#334155] text-gray-200 
               px-4 py-2 rounded-lg w-28
               focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />

  <button
    onClick={generateFlashcards}
    disabled={loading}
    className="bg-indigo-600 hover:bg-indigo-500 text-white 
               px-6 py-2 rounded-lg font-semibold
               transition disabled:opacity-50"
  >
    {loading ? "Generating..." : "Generate Flashcards"}
  </button>
</div>

        {error && (
          <p className="text-red-400 mt-2">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {flashcards.map((card, i) => (
            <div
  key={i}
  className="group bg-gradient-to-br from-[#020617] to-[#020617]/80 
             border border-[#334155] rounded-xl p-5 
             hover:border-indigo-500 transition-all duration-300
             hover:shadow-xl hover:shadow-indigo-500/10"
>
  {/* Question */}
  <p className="text-indigo-400 font-semibold mb-3">
    Q{i + 1}.
    <span className="text-gray-100 ml-1">
      {card.question}
    </span>
  </p>

  {/* Divider */}
  <div className="h-px bg-[#334155] mb-3" />

  {/* Answer */}
  <p className="text-gray-300 leading-relaxed">
    <span className="text-emerald-400 font-semibold">Answer:</span>{" "}
    {card.answer}
  </p>
</div>
          ))}
        </div>

        {flashcards.length === 0 && !loading && !error && (
          <p className="text-gray-400 mt-6 text-sm">
            Generate flashcards from your uploaded PDF to start studying.
          </p>
        )}
      </div>
    </div>
  );
}