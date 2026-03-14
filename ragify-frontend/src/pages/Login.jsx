// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* 🔥 SINGLE SOURCE OF TRUTH */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard", { replace: true });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [navigate]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // redirect handled by onAuthStateChanged
    } catch (err) {
      alert(err.message);
    }
  };

 const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-gray-400">
        Checking session…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-6">
      <div className="bg-[#1e293b] border border-[#334155] p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center mb-6 text-indigo-400">
          RAGify
        </h2>

        <input
          className="w-full mb-4 px-4 py-2 bg-[#020617] border border-[#334155] text-gray-200 rounded-lg"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-4 px-4 py-2 bg-[#020617] border border-[#334155] text-gray-200 rounded-lg"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg mb-3"
        >
          Login
        </button>

        <div className="text-center text-gray-400 text-sm mb-3">OR</div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white text-black py-2 rounded-lg font-semibold hover:bg-gray-200"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm mt-4 text-gray-400">
          No account?{" "}
          <Link to="/signup" className="text-indigo-400 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}