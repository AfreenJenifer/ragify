# RAGify – AI Powered Document Learning Assistant

RAGify is an AI-powered document learning system that helps users understand large documents quickly by generating summaries, flashcards, and MCQs using Retrieval-Augmented Generation (RAG).
It allows users to upload PDFs and interact with their content in an intelligent and structured learning format.

---

## 🚀 Features

* 📄 Upload and process PDF documents
* 🧠 AI-generated summaries for quick understanding
* 🃏 Automatic flashcard generation for revision
* ❓ Multiple Choice Questions (MCQs) for self-assessment
* 📚 Study set storage for previously generated learning materials
* ⚡ Fast document retrieval using FAISS vector search

---

## 🏗️ Project Architecture

Frontend communicates with the backend API.
The backend processes documents using embeddings and retrieves relevant information using FAISS.

```
User
  │
  ▼
Frontend (Web Interface)
  │
  ▼
FastAPI Backend
  │
  ├── PDF Processing
  ├── Embeddings Generation
  ├── FAISS Vector Database
  └── LLM Response Generation
  │
  ▼
Learning Outputs
(Summary, Flashcards, MCQs)
```

---

## 🛠️ Tech Stack

### Frontend

* HTML
* CSS
* JavaScript
* React (if used)

### Backend

* Python
* FastAPI
* FAISS (Vector Search)
* NumPy
* LangChain / Embedding models

### AI / RAG Components

* Retrieval-Augmented Generation (RAG)
* Document Embeddings
* Vector Similarity Search

---

## 📂 Project Structure

```
ragify
│
├── ragify-backend
│   ├── main.py
│   ├── requirements.txt
│   ├── faiss_index
│   └── backend modules
│
├── ragify-frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── frontend components
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```
git clone https://github.com/yourusername/ragify.git
cd ragify
```

---

### 2️⃣ Backend Setup

```
cd ragify-backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend will run on:

```
http://localhost:8000
```

---

### 3️⃣ Frontend Setup

```
cd ragify-frontend
npm install
npm start
```

Frontend will run on:

```
http://localhost:3000
```

---

## 🎯 Use Case

RAGify helps students and researchers learn faster by transforming large documents into structured learning material such as summaries, flashcards, and quizzes.

---

## 🔮 Future Scope

* 🎙️ Voice-based learning interaction
* 📄 Multi-document support
* 🤝 Real-time collaborative learning
* 📱 Mobile application integration

---

## 👩‍💻 Author

Afreen Jenifer

Computer Science Engineering Student
