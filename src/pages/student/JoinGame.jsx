import { useState } from "react";

function JoinGame() {
  const [studentName, setStudentName] = useState("");
  const [gameCode, setGameCode] = useState("");

  function handleJoin() {
    if (!studentName || !gameCode) {
      alert("Please enter your name and game code.");
      return;
    }

    alert(`Welcome ${studentName}! Joining game ${gameCode}`);
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
          <label className="block mb-2 text-sm text-slate-300">Student Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-500 text-white outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm text-slate-300">Game Code</label>
          <input
            type="text"
            placeholder="Enter game code"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-500 text-white outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <button
          onClick={handleJoin}
          className="w-full game-font bg-cyan-500 hover:bg-cyan-400 text-slate-900 py-3 rounded-xl transition"
        >
          Join
        </button>
      </div>
    </div>
  );
}

export default JoinGame;