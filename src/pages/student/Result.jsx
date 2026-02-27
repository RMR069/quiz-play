import { useLocation, useNavigate } from "react-router-dom";

function Result() {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state?.studentName || !state?.gameCode) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-slate-800 border border-slate-600 rounded-2xl shadow-xl p-8 text-center">
          <h1 className="game-font text-3xl text-yellow-300 mb-4">Oops!</h1>
          <p className="text-slate-300 mb-6">You need to join a game first.</p>
          <button
            onClick={() => navigate("/student/join")}
            className="game-font bg-cyan-500 hover:bg-cyan-400 text-slate-900 py-3 px-6 rounded-xl transition"
          >
            Go to Join Page
          </button>
        </div>
      </div>
    );
  }

  const { studentName, gameCode, score, total } = state;
  const percent = Math.round((score / total) * 100);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl bg-slate-800 border border-slate-600 rounded-2xl shadow-xl p-8 text-center">
        <h1 className="game-font text-4xl text-yellow-300 mb-4">Results</h1>

        <p className="text-slate-300 mb-8">
          Player: <span className="text-white font-semibold">{studentName}</span>{" "}
          • Code: <span className="text-yellow-300 game-font">{gameCode}</span>
        </p>

        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 mb-8">
          <p className="text-slate-300">Your Score</p>
          <p className="game-font text-6xl text-cyan-300 mt-2">
            {score} / {total}
          </p>
          <p className="text-slate-300 mt-3">{percent}%</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/student/join")}
            className="w-full game-font bg-cyan-500 hover:bg-cyan-400 text-slate-900 py-3 rounded-xl transition"
          >
            Play Again
          </button>

          <button
            onClick={() => navigate("/student/leaderboard", { state })}
            className="w-full game-font bg-yellow-300 hover:bg-yellow-200 text-slate-900 py-3 rounded-xl transition"
          >
            View Leaderboard
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-transparent border border-slate-600 hover:bg-slate-700 py-3 rounded-xl transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Result;