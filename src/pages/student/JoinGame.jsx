import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase";

function JoinGame() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [studentName, setStudentName] = useState("");
  const [gameCode, setGameCode] = useState("");

  const [nameError, setNameError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [joinError, setJoinError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setGameCode(codeFromUrl);
    }
  }, [searchParams]);

  async function handleJoin() {
    let hasError = false;

    setNameError("");
    setCodeError("");
    setJoinError("");

    const name = studentName.trim();
    const code = gameCode.trim();

    if (!name) {
      setNameError("Please enter your name.");
      hasError = true;
    }

    if (!code) {
      setCodeError("Please enter the game code.");
      hasError = true;
    }

    if (hasError) return;

    try {
      setIsJoining(true);

      const sessionRef = doc(db, "sessions", code);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        setJoinError("Session not found. Please check the game code.");
        return;
      }

      const sessionData = sessionSnap.data();
      const players = Array.isArray(sessionData.players) ? sessionData.players : [];

      const alreadyExists = players.some(
        (player) => player.toLowerCase() === name.toLowerCase()
      );

      if (!alreadyExists) {
        await updateDoc(sessionRef, {
          players: arrayUnion(name),
        });
      }

      navigate("/student/lobby", {
        state: { studentName: name, gameCode: code },
      });
    } catch (error) {
      console.error("Error joining session:", error);
      setJoinError("Failed to join session. Please try again.");
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-slate-800 border border-slate-600 rounded-2xl shadow-xl p-8">
        <h1 className="game-font text-3xl text-cyan-300 text-center mb-6">
          Join Game
        </h1>

        <p className="text-slate-300 text-center mb-8">
          Enter your name and the game code to join the live quiz.
        </p>

        <div className="mb-4">
          <label className="block mb-2 text-sm text-slate-300">
            Student Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={studentName}
            onChange={(e) => {
              setStudentName(e.target.value);
              if (nameError) setNameError("");
              if (joinError) setJoinError("");
            }}
            className={`w-full px-4 py-3 rounded-xl bg-slate-700 border text-white outline-none focus:ring-2 ${
              nameError
                ? "border-red-400 focus:ring-red-400"
                : "border-slate-500 focus:ring-cyan-400"
            }`}
          />
          {nameError && <p className="mt-2 text-sm text-red-400">{nameError}</p>}
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm text-slate-300">Game Code</label>
          <input
            type="text"
            placeholder="Enter game code"
            value={gameCode}
            onChange={(e) => {
              setGameCode(e.target.value);
              if (codeError) setCodeError("");
              if (joinError) setJoinError("");
            }}
            className={`w-full px-4 py-3 rounded-xl bg-slate-700 border text-white outline-none focus:ring-2 ${
              codeError
                ? "border-red-400 focus:ring-red-400"
                : "border-slate-500 focus:ring-cyan-400"
            }`}
          />
          {codeError && <p className="mt-2 text-sm text-red-400">{codeError}</p>}
        </div>

        {joinError && (
          <p className="mb-4 text-sm text-red-400 text-center">{joinError}</p>
        )}

        <button
          onClick={handleJoin}
          disabled={isJoining}
          className={`w-full game-font py-3 rounded-xl transition ${
            isJoining
              ? "bg-slate-600 text-slate-300 cursor-not-allowed"
              : "bg-cyan-500 hover:bg-cyan-400 text-slate-900"
          }`}
        >
          {isJoining ? "Joining..." : "Join"}
        </button>
      </div>
    </div>
  );
}

export default JoinGame;