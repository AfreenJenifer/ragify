// src/pages/Signup.jsx
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Email + Password signup
  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  // Google signup (same as login)
  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-6">
      <div className="bg-[#1e293b] border border-[#334155] p-8 rounded-2xl shadow-2xl w-full max-w-sm">
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
          onClick={handleSignup}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg mb-3"
        >
          Sign Up
        </button>

        <div className="text-center text-gray-400 text-sm mb-3">OR</div>

        <button
          onClick={handleGoogleSignup}
          className="w-full bg-white text-black py-2 rounded-lg font-semibold hover:bg-gray-200"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm mt-4 text-gray-400">
          Already have an account?{" "}
          <Link to="/" className="text-indigo-400 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}