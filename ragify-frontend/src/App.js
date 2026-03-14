// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UploadPDF from "./pages/UploadPDF";
import Summary from "./pages/Summary";
import Flashcards from "./pages/Flashcards";
import MCQ from "./pages/MCQ";
import ConceptGraph from "./pages/ConceptGraph";
import StudySets from "./pages/StudySets";
import StudySetViewer from "./pages/StudySetViewer";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadPDF />} />
        <Route path="/summary" element={<Summary />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/mcq" element={<MCQ />} />
        <Route path="/concept-graph" element={<ConceptGraph />} />
        <Route path="/study-sets" element={<StudySets />} />
        <Route path="/study-set/:id" element={<StudySetViewer />} />

      </Routes>
    </Router>
  );
}
