import os
import faiss
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from groq import Groq
from typing import List
from typing import List, Optional, Dict, Any
import json, re

# ------------------ Setup ------------------
import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate("firebase-key.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("❌ GROQ_API_KEY missing in .env")

groq_client = Groq(api_key=GROQ_API_KEY)
from sentence_transformers import SentenceTransformer

_embed_model = None

def get_embed_model():
    global _embed_model
    if _embed_model is None:
        _embed_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embed_model

app = FastAPI(title="RAGify Backend (Groq)")

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ Global State ------------------

CURRENT_CHUNKS: list[str] = []
CHUNKS_META: list[dict] = []
FAISS_INDEX = None


# ------------------ Helpers ------------------

def process_pdf(file_path: str):
    global CURRENT_CHUNKS, CHUNKS_META, FAISS_INDEX

    reader = PdfReader(file_path)

    text_chunks = []
    chunks_meta = []

    for page_number, page in enumerate(reader.pages):
        page_text = (page.extract_text() or "").strip()
        if not page_text:
            continue

        chunks = [page_text[i:i+500] for i in range(0, len(page_text), 500)]

        for chunk in chunks:
            text_chunks.append(chunk)
            chunks_meta.append({
                "text": chunk,
                "page": page_number + 1
            })

    if not text_chunks:
        raise ValueError("No text found in PDF")

    model = get_embed_model()
    embeddings = model.encode(text_chunks)
    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(embeddings).astype("float32"))

    faiss.write_index(index, "faiss.index")
    np.save("metadata.npy", chunks_meta)

    CURRENT_CHUNKS = text_chunks
    CHUNKS_META = chunks_meta
    FAISS_INDEX = index

    print("✅ PDF processed. Chunks:", len(text_chunks))

    return text_chunks, chunks_meta


def load_index():
    global FAISS_INDEX, CHUNKS_META

    if FAISS_INDEX is None:
        if not os.path.exists("faiss.index") or not os.path.exists("metadata.npy"):
            raise HTTPException(status_code=400, detail="No PDF uploaded yet")

        FAISS_INDEX = faiss.read_index("faiss.index")
        CHUNKS_META = np.load("metadata.npy", allow_pickle=True).tolist()


# ------------------ Models ------------------

class QueryRequest(BaseModel):
    question: str

class MCQRequest(BaseModel):
    count: int = 5

class FlashcardRequest(BaseModel):
    num_cards: int = 10

class GraphRequest(BaseModel):
    depth: int = 5


# ------------------ Routes ------------------

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)

        file_path = os.path.join(upload_dir, file.filename)

        with open(file_path, "wb") as f:
            f.write(await file.read())

        process_pdf(file_path)

        return {"message": "PDF uploaded successfully!"}

    except Exception as e:
        print("UPLOAD ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-summary")
async def generate_summary():
    try:
        load_index()

        context = " ".join(CURRENT_CHUNKS[:10])

        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful summarization assistant."},
                {"role": "user", "content": f"Summarize the following document:\n\n{context}"}
            ],
            temperature=0.3,
        )

        summary = completion.choices[0].message.content.strip()
        return {"summary": summary}

    except Exception as e:
        print("SUMMARY ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ask")
def ask(payload: QueryRequest):
    try:
        load_index()

        model = get_embed_model()
        query_embedding = model.encode([payload.question])
        D, I = FAISS_INDEX.search(np.array(query_embedding).astype("float32"), 5)

        matches = []
        for idx in I[0]:
            if idx < len(CHUNKS_META):
                matches.append(CHUNKS_META[idx])

        if not matches:
            return {"answer": "Not found in document.", "pages": []}

        context = "\n\n".join([m["text"] for m in matches])
        pages = sorted(set([m["page"] for m in matches]))

        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Answer only from the document context."},
                {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {payload.question}"}
            ],
            temperature=0.2
        )

        answer = completion.choices[0].message.content.strip()
        return {"answer": answer, "pages": pages}

    except Exception as e:
        print("ASK ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-flashcards")
async def generate_flashcards(payload: FlashcardRequest):
    try:
        load_index()

        context = " ".join([c["text"] for c in CHUNKS_META[:5]])

        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You generate study flashcards in strict JSON only."
                },
                {
                    "role": "user",
                    "content": f"""
Generate EXACTLY {payload.num_cards} flashcards.

STRICT RULES:
- Return ONLY valid JSON
- Each item must contain non-empty question and answer
- Each question must be unique
- No explanations, no markdown

FORMAT:
[
  {{"question": "...", "answer": "..."}}
]

CONTENT:
{context}
"""
                }
            ],
            temperature=0.2
        )

        raw = completion.choices[0].message.content.strip()

        import json, re

        match = re.search(r"\[.*\]", raw, re.S)
        if not match:
            raise ValueError("Invalid JSON returned by model")

        cards = json.loads(match.group())

        # ✅ CLEAN + DEDUPE
        seen = set()
        clean_cards = []

        for c in cards:
            q = c.get("question", "").strip()
            a = c.get("answer", "").strip()

            if not q or not a:
                continue

            key = q.lower()
            if key in seen:
                continue

            seen.add(key)
            clean_cards.append({"question": q, "answer": a})

        # ✅ ENFORCE COUNT (HARD GUARANTEE)
        final_cards = clean_cards[: payload.num_cards]

        return {
            "flashcards": final_cards,
            "requested": payload.num_cards,
            "generated": len(final_cards)
        }

    except Exception as e:
        print("FLASHCARD ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-mcq")
def generate_mcq(payload: MCQRequest):
    try:
        load_index()

        context = "\n".join(c["text"] for c in CHUNKS_META[:6])

        prompt = f"""
Generate {payload.count} MCQs from the content below.

STRICT RULES:
- Return ONLY valid JSON
- No explanation, no markdown
- Each MCQ must have:
  - question (string)
  - options (array of 4 strings)
  - answer (must match exactly one option)

OUTPUT FORMAT:
[
  {{
    "question": "Question text",
    "options": ["A", "B", "C", "D"],
    "answer": "B"
  }}
]

CONTENT:
{context}
"""

        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You generate exam MCQs in strict JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )

        raw = completion.choices[0].message.content.strip()

        # 🔐 SAFETY: extract JSON only
        import re, json
        match = re.search(r"\[.*\]", raw, re.S)
        if not match:
            raise ValueError("Invalid MCQ JSON")

        mcqs = json.loads(match.group())

        return {"mcqs": mcqs}

    except Exception as e:
        print("MCQ ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/concept-graph")
def concept_graph(payload: GraphRequest):

    # 🔁 Always reload latest PDF data from disk
    if not os.path.exists("metadata.npy"):
        raise HTTPException(status_code=400, detail="Upload PDF first")

    chunks_meta = np.load("metadata.npy", allow_pickle=True).tolist()

    if not chunks_meta or len(chunks_meta) == 0:
        raise HTTPException(status_code=400, detail="Upload PDF first")

    context = "\n".join(c["text"] for c in chunks_meta[:8])

    prompt = f"""
You are an expert knowledge graph generator.

GOAL:
Build a prerequisite dependency graph using ONLY the document text.

STRICT RULES:
1. Extract ONLY concepts explicitly present in the text.
2. Do NOT invent concepts or assume syllabus structure.
3. Ignore:
   - Author names
   - Place names
   - Institute names
   - Numbers, years, IDs
4. Prefer:
   - Technical terms
   - Theoretical topics
   - Methods
   - Algorithms
   - Models
   - Definitions
5. Each dependency must be:
   prerequisite → advanced concept
6. No circular dependencies.
7. No duplicate concepts.
8. Max 25 concepts total.
9. Keep concept names short (2–5 words).

OUTPUT FORMAT (STRICT JSON ONLY):
[
  {{
    "concept": "Concept Name",
    "depends_on": ["Prerequisite 1", "Prerequisite 2"]
  }}
]

Document:
{context}
"""

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You generate structured concept dependency graphs."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1
        )

        return {"graph_raw": completion.choices[0].message.content}

    except Exception as e:
        print("GRAPH ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/")
def root():
    return {"status": "RAGify backend running on Groq"}

from pydantic import BaseModel
from typing import List, Optional
from fastapi import HTTPException

class QAItem(BaseModel):
    question: str
    answer: str

class SaveStudySetRequest(BaseModel):
    user_id: str
    file_name: str
    summary: Optional[str] = ""
    qa: List[QAItem] = []

@app.post("/save-study-set")
async def save_study_set(payload: SaveStudySetRequest):
    try:
        doc_ref = (
            db.collection("users")
            .document(payload.user_id)
            .collection("studySets")
            .document()
        )

        doc_ref.set({
            "fileName": payload.file_name,
            "summary": payload.summary,
            "qa": [q.dict() for q in payload.qa],
            "uploadedAt": firestore.SERVER_TIMESTAMP,
        })

        return {
            "status": "ok",
            "studySetId": doc_ref.id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


    return {"status": "success"}






@app.get("/study-sets/{user_id}")
def list_study_sets(user_id: str):
    try:
        docs = (
            db.collection("users")
            .document(user_id)
            .collection("studySets")
            .order_by("uploadedAt", direction=firestore.Query.DESCENDING)
            .stream()
        )

        result = []
        for d in docs:
            data = d.to_dict()
            data["id"] = d.id
            result.append(data)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/study-set/{user_id}/{set_id}")
def get_study_set(user_id: str, set_id: str):
    try:
        doc = (
            db.collection("users")
            .document(user_id)
            .collection("studySets")
            .document(set_id)
            .get()
        )

        if not doc.exists:
            raise HTTPException(status_code=404, detail="Study set not found")

        data = doc.to_dict()
        data["id"] = set_id
        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


