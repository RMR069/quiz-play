import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZXwPQabBnCj1x4KIYl0jsRmMTeyLHYzI",
  authDomain: "quizplay-6bc74.firebaseapp.com",
  projectId: "quizplay-6bc74",
  storageBucket: "quizplay-6bc74.firebasestorage.app",
  messagingSenderId: "1049529032829",
  appId: "1:1049529032829:web:3960c2742ba35c90fe5114",
  measurementId: "G-TH0G4Q9BHG",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };