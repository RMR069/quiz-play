import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

function generateGameCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function CreateSession() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [gameCode] = useState(generateGameCode());
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileName = state?.fileName ?? "No file uploaded";
  const questionCount = state?.questionCount ?? 5;
  const timePerQuestion = state?.timePerQuestion ?? 5;

  async function handleCreateSession() {
    try {
      setIsCreating(true);
      setError("");
      setSuccess("");

      const sessionRef = doc(db, "sessions", gameCode);

      await setDoc(sessionRef, {
        gameCode,
        fileName,
        questionCount,
        timePerQuestion,
        players: [],
        status: "waiting",
        createdAt: serverTimestamp(),
      });

      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        throw new Error("Session was not saved in Firestore.");
      }

      setSuccess(`Session created successfully: ${gameCode}`);

      setTimeout(() => {
        navigate("/instructor/session-official", {
          state: {
            gameCode,
            fileName,
            questionCount,
            timePerQuestion,
          },
        });
      }, 1200);
    } catch (err) {
      console.error("Error creating session:", err);
      setError(`Failed to create session: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl bg-slate-800 rounded-2xl p-8 shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-4">Create Session</h1>

        <p className="text-slate-300 mb-2">Game Code</p>
        <div className="text-4xl font-extrabold text-cyan-400 mb-6">
          {gameCode}
        </div>

        <div className="rounded-2xl border border-slate-600 bg-slate-700/50 p-5 mb-6 text-left">
          <p className="text-sm text-slate-300 mb-2">
            <span className="font-semibold text-white">File:</span> {fileName}
          </p>
          <p className="text-sm text-slate-300 mb-2">
            <span className="font-semibold text-white">Questions:</span> {questionCount}
          </p>
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-white">Time per Question:</span>{" "}
            {timePerQuestion}s
          </p>
        </div>

        {error && (
          <p className="text-red-400 mb-4 break-words">{error}</p>
        )}

        {success && (
          <p className="text-green-400 mb-4 break-words">{success}</p>
        )}

        <button
          onClick={handleCreateSession}
          disabled={isCreating}
          className={`w-full py-3 rounded-xl font-bold transition ${
            isCreating
              ? "bg-slate-600 text-slate-300 cursor-not-allowed"
              : "bg-cyan-500 hover:bg-cyan-400 text-slate-900"
          }`}
        >
          {isCreating ? "Creating..." : "Create Session"}
        </button>
      </div>
    </div>
  );
}

export default CreateSession;