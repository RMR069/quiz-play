import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function Session() {
  const navigate = useNavigate();

  // Generate a mock game code once
  const gameCode = useMemo(() => {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // avoid confusing chars like I/O
    const nums = "23456789"; // avoid 0/1 confusion
    const pick = (s) => s[Math.floor(Math.random() * s.length)];
    return `${pick(letters)}${pick(letters)}${pick(nums)}${pick(nums)}`;
  }, []);

  // Mock players (prototype)
  const [players, setPlayers] = useState(["Sara", "Fahad"]);
  const [status, setStatus] = useState("waiting"); // waiting | live | ended
  const [questionIndex, setQuestionIndex] = useState(0);

  // For prototype: simulate players joining while waiting
  useEffect(() => {
    if (status !== "waiting") return;

    const namesPool = ["Radi", "Hanan", "Ali", "Nora", "Omar"];
    let i = 0;

    const id = setInterval(() => {
      if (i >= namesPool.length) {
        clearInterval(id);
        return;
      }
      setPlayers((prev) => [...prev, namesPool[i]]);
      i += 1;
    }, 2500);

    return () => clearInterval(id);
  }, [status]);

  function startGame() {
    setStatus("live");
    setQuestionIndex(1);
  }

  function nextQuestion() {
    setQuestionIndex((q) => q + 1);
  }

  function endGame() {
    setStatus("ended");
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-3xl bg-slate-800 border border-slate-600 rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="game-font text-4xl text-yellow-300">Session</h1>
            <p className="text-slate-300 mt-2">
              Status:{" "}
              <span className="text-white font-semibold">
                {status === "waiting"
                  ? "Waiting"
                  : status === "live"
                  ? "Live"
                  : "Ended"}
              </span>
              {status === "live" ? (
                <>
                  {" "}
                  • Current question:{" "}
                  <span className="text-white font-semibold">
                    {questionIndex}
                  </span>
                </>
              ) : null}
            </p>
          </div>

          {/* Game Code */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 text-center">
            <p className="text-slate-300 text-sm">Game Code</p>
            <p className="game-font text-4xl text-cyan-300 mt-1">{gameCode}</p>
          </div>
        </div>

        {/* Players box */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="game-font text-2xl text-pink-300">Players</h2>
            <span className="text-slate-300 text-sm">{players.length} joined</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {players.map((p, idx) => (
              <div
                key={`${p}-${idx}`}
                className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3"
              >
                <span className="text-white">{p}</span>
              </div>
            ))}
          </div>

          {status === "waiting" ? (
            <div className="mt-5">
              <p className="text-slate-300 text-sm mb-2">
                Waiting for players... (prototype auto-joins)
              </p>
              <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-cyan-400 animate-pulse" />
              </div>
            </div>
          ) : null}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={startGame}
            disabled={status !== "waiting"}
            className={[
              "w-full game-font py-3 rounded-xl transition",
              status === "waiting"
                ? "bg-cyan-500 hover:bg-cyan-400 text-slate-900"
                : "bg-slate-700 text-slate-400 cursor-not-allowed",
            ].join(" ")}
          >
            Start
          </button>

          <button
            onClick={nextQuestion}
            disabled={status !== "live"}
            className={[
              "w-full game-font py-3 rounded-xl transition",
              status === "live"
                ? "bg-yellow-300 hover:bg-yellow-200 text-slate-900"
                : "bg-slate-700 text-slate-400 cursor-not-allowed",
            ].join(" ")}
          >
            Next
          </button>

          <button
            onClick={endGame}
            disabled={status === "ended"}
            className={[
              "w-full game-font py-3 rounded-xl transition",
              status !== "ended"
                ? "bg-pink-400 hover:bg-pink-300 text-slate-900"
                : "bg-slate-700 text-slate-400 cursor-not-allowed",
            ].join(" ")}
          >
            End
          </button>
        </div>

        {/* Bottom actions */}
        <div className="mt-6 flex flex-col md:flex-row gap-3">
          <button
            onClick={() => navigate("/instructor/dashboard")}
            className="w-full md:w-auto bg-transparent border border-slate-600 hover:bg-slate-700 py-3 px-6 rounded-xl transition"
          >
            Back to Dashboard
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full md:flex-1 bg-transparent border border-slate-600 hover:bg-slate-700 py-3 rounded-xl transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Session;