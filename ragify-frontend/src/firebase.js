import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";





const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "ragify-project.firebaseapp.com",
  projectId: "ragify-project",
  storageBucket: "ragify-project.firebasestorage.app",
  messagingSenderId: "1049871794290",
  appId: "1:1049871794290:web:608290d93d5a98db0082eb"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
// ✅ ADD THIS EXPORT
export { firebaseConfig };
googleProvider.setCustomParameters({
  prompt: "select_account",
});