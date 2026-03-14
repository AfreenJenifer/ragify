import { db, auth } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function saveStudySet({ summary, fileName }) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  const ref = collection(db, "users", user.uid, "studySets");

  await addDoc(ref, {
    summary,
    fileName,
    uploadedAt: serverTimestamp(),
  });
}
