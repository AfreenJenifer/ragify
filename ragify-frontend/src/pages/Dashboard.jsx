// src/pages/Dashboard.jsx
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useEffect, useState } from "react";



export default function Dashboard() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/");
    } else {
      setUserEmail(user.email);
    }
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    
    localStorage.removeItem("currentSummary");
    localStorage.removeItem("currentQA");
    localStorage.removeItem("currentFlashcards");
    localStorage.removeItem("currentMCQs");
    localStorage.removeItem("currentConceptNodes");
    localStorage.removeItem("currentConceptEdges");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">
            RAGify Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Logged in as: <span className="text-indigo-400">{userEmail}</span>
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-lg transition shadow"
        >
          Logout
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          onClick={() => navigate("/upload")}
          className="p-6 bg-[#1e293b] border border-[#334155] rounded-xl shadow cursor-pointer hover:bg-[#24324a] transition"
        >
          <h2 className="text-lg font-semibold text-indigo-400">
            📄 Upload PDF
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Upload a document to start analyzing.
          </p>
        </div>

        <div
          onClick={() => navigate("/summary")}
          className="p-6 bg-[#1e293b] border border-[#334155] rounded-xl shadow cursor-pointer hover:bg-[#24324a] transition"
        >
          <h2 className="text-lg font-semibold text-indigo-400">
            📝 Summary & Q&A
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Generate summaries and ask questions.
          </p>
        </div>

        <div
          onClick={() => navigate("/flashcards")}
          className="p-6 bg-[#1e293b] border border-[#334155] rounded-xl shadow cursor-pointer hover:bg-[#24324a] transition"
        >
          <h2 className="text-lg font-semibold text-indigo-400">
            🧠 Flashcards
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Generate flashcards for revision.
          </p>
        </div>

        <div
          onClick={() => navigate("/mcq")}
          className="p-6 bg-[#1e293b] border border-[#334155] rounded-xl shadow cursor-pointer hover:bg-[#24324a] transition"
        >
          <h2 className="text-lg font-semibold text-indigo-400">
            ❓ MCQs
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Practice with multiple-choice questions.
          </p>
        </div>

        <div
          onClick={() => navigate("/concept-graph")}
          className="p-6 bg-[#1e293b] border border-[#334155] rounded-xl shadow cursor-pointer hover:bg-[#24324a] transition"
        >
          <h2 className="text-lg font-semibold text-indigo-400">
            🧩 Concept Graph
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Visualize topic dependencies.
          </p>
        </div>
        <div
  onClick={() => navigate("/study-sets")}
  className="p-6 bg-[#1e293b] border border-[#334155] rounded-xl shadow cursor-pointer hover:bg-[#24324a] transition"
>
  <h2 className="text-lg font-semibold text-indigo-400">
    📚 Study Sets
  </h2>
  <p className="text-gray-400 text-sm mt-2">
    View saved summaries & flashcards.
  </p>
</div>

      </div>
    </div>
  );
}
