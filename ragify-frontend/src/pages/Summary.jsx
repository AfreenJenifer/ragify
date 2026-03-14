
import axios from "axios";
import { auth } from "../firebase";
import { useState, useEffect } from "react";

export default function Summary() {
  const [summary, setSummary] = useState("");
  const [question, setQuestion] = useState("");
  const [qa, setQa] = useState([]);

  const user = auth.currentUser;
  useEffect(() => {
    const savedSummary = localStorage.getItem("currentSummary");
    const savedQA = localStorage.getItem("currentQA");

    if (savedSummary) {
      setSummary(savedSummary);
    }

    if (savedQA) {
      setQa(JSON.parse(savedQA));
    }
  }, []);
  /* -------------------- HELPERS -------------------- */
  const formatText = (text) => {
  if (!text) return "";

  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold
    .replace(/\n\d+\.\s/g, "<br/>• ")                 // numbered list → bullets
    .replace(/\n\*\s/g, "<br/>• ")                    // * → bullets
    .replace(/\n{2,}/g, "<br/><br/>")                 // only DOUBLE newlines → paragraph
    .replace(/\n/g, "<br/>");                         // single newline → single break
};

  /* -------------------- ACTIONS -------------------- */
 const generateSummary = async () => {
  try {
    const res = await axios.post("http://127.0.0.1:8000/generate-summary");
    const summaryText = res.data.summary || res.data;

    setSummary(summaryText);
    localStorage.setItem("currentSummary", summaryText); // ✅ SAVE
  } catch (err) {
    console.error(err);
    alert("Failed to generate summary");
  }
};

  const askQuestion = async () => {
    if (!question.trim()) return;

    const q = question;
    setQuestion("");

    // show question instantly
    setQa((prev) => [...prev, { question: q, answer: "Thinking..." }]);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/ask",
        { question: q }
      );

      setQa((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          question: q,
          answer: res.data.answer,
          pages: res.data.pages || [],
        };
        localStorage.setItem("currentQA", JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error(err);
      alert("Failed to get answer");
    }
  };

  const saveStudySet = async () => {
    if (!user) return alert("Login required");

    await axios.post("http://127.0.0.1:8000/save-study-set", {
      user_id: user.uid,
      file_name: localStorage.getItem("uploadedFileName") || "Untitled PDF",
      summary,
      qa,
    });

    alert("Study set saved!");
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-[#0f172a] p-6 text-white">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-400">
            📄 Document Summary
          </h1>

          <button
            onClick={generateSummary}
            className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-lg font-semibold"
          >
            Generate Summary
          </button>
        </div>

        {/* SUMMARY */}
        {summary && (
          <section className="bg-[#1e293b] p-6 rounded-xl border border-[#334155]">
            <h2 className="text-lg font-bold text-indigo-400 mb-3">
              📌 Summary
            </h2>

            <div
              className="text-gray-200 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: formatText(summary),
              }}
            />
          </section>
        )}

        {/* ASK QUESTION */}
        <section className="bg-[#1e293b] p-6 rounded-xl border border-[#334155]">
          <h2 className="text-lg font-bold text-emerald-400 mb-3">
            💬 Ask a Question
          </h2>

          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#020617] border border-[#334155] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Ask something from the document..."
          />

          <button
            onClick={askQuestion}
            className="mt-3 bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-lg font-semibold"
          >
            Ask
          </button>
        </section>

        {/* Q&A CHAT */}
        {qa.length > 0 && (
          <section className="space-y-5">
            <h2 className="text-lg font-bold text-indigo-400">
              🧠 Questions & Answers
            </h2>

            {qa.map((item, i) => (
              <div
                key={i}
                className="bg-[#020617] border border-[#334155] rounded-xl p-5"
              >
                <p className="text-indigo-300 font-semibold mb-2">
                  ❓ {item.question}
                </p>

                <div
                  className="text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: formatText(item.answer),
                  }}
                />
                {item.pages && item.pages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                  {item.pages.map((p, idx) => (
                    <span
                      key={idx}
                      className="bg-indigo-600/20 text-indigo-300 px-2 py-0.5 rounded-full text-xs"
                    >
                      Page {p}
                    </span>
                  ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* SAVE */}
        {(summary || qa.length > 0) && (
          <button
            onClick={saveStudySet}
            className="w-full bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold"
          >
            💾 Save Study Set
          </button>
        )}

      </div>
    </div>
  );
}