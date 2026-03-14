// src/pages/StudySetViewer.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { useParams } from "react-router-dom";

export default function StudySetViewer() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchSet = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const res = await axios.get(
        `http://127.0.0.1:8000/study-set/${user.uid}/${id}`
      );
      setData(res.data);
    };

    fetchSet();
  }, [id]);

  // 🔴 IMPORTANT: wait until data is loaded
  if (!data) {
    return <p className="text-white p-6">Loading...</p>;
  }
  const formatText = (text) => {
  if (!text) return "";

  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold
    .replace(/\n\d+\.\s/g, "<br/>• ")                 // numbered → bullets
    .replace(/\n\*\s/g, "<br/>• ")                    // * → bullets
    .replace(/\n{2,}/g, "<br/><br/>")                 // paragraph gap
    .replace(/\n/g, "<br/>");                         // normal line break
};
  // ✅ RENDER STUDY SET HERE
  return (
    <div className="min-h-screen bg-[#0f172a] p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">
        📄 {data.fileName || "Untitled PDF"}
      </h1>

      {/* SUMMARY */}
      <section className="bg-[#1e293b] p-6 rounded-2xl border border-[#334155]">
  <h2 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
    📌 Summary
  </h2>

  <div
    className="text-gray-200 leading-relaxed text-[15px]"
    dangerouslySetInnerHTML={{
      __html: formatText(data.summary),
    }}
  />
</section>

      {/* Q&A */}
      <section className="bg-[#1e293b] p-6 rounded-2xl border border-[#334155] mt-8">
  <h2 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
    💬 Questions & Answers
  </h2>

  <div className="space-y-5">
    {data.qa.map((item, i) => (
      <div
        key={i}
        className="bg-[#020617] border border-[#334155] rounded-xl p-5"
      >
        {/* QUESTION */}
        <p className="text-indigo-300 font-semibold mb-2">
          ❓ {item.question}
        </p>

        {/* ANSWER */}
        <div
          className="text-gray-300 leading-snug"
          dangerouslySetInnerHTML={{
            __html: formatText(item.answer),
          }}
        />

        {/* PAGE REFERENCES */}
        {item.pages && item.pages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {item.pages.map((p, idx) => (
              <span
                key={idx}
                className="bg-indigo-600/20 text-indigo-300 px-3 py-1 rounded-full text-xs"
              >
                Page {p}
              </span>
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
</section>
    </div>
  );
}