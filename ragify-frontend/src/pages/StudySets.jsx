import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function StudySets() {
  const [sets, setSets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchSets = async () => {
    const user = auth.currentUser;
    const res = await axios.get(
      `http://127.0.0.1:8000/study-sets/${user.uid}`
    );
    setSets(res.data); // already sorted
  };

  fetchSets();
}, []);

  return (
    <div className="min-h-screen bg-[#0f172a] p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">📚 My Study Sets</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {sets.map((s) => (
          <div
  key={s.id}
  className="bg-[#1e293b] p-5 rounded-xl border border-[#334155] hover:border-indigo-500 cursor-pointer"
  onClick={() => navigate(`/study-set/${s.id}`)}
>
  <h2 className="text-lg font-bold text-indigo-400">
    {s.fileName || "Untitled PDF"}
  </h2>

  <p className="text-gray-300 mt-2 line-clamp-3">
    {s.summary?.slice(0, 180)}...
  </p>

  <div className="mt-3 text-sm text-gray-400">
  ❓ Questions Asked: {s.qa?.length || 0}
</div>
</div>

        ))}
      </div>
    </div>
  );
}
