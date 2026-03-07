import { useLocation, useNavigate } from "react-router-dom";

function FinalResults() {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state?.studentName || !state?.gameCode) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-6">
        <button
          onClick={() => navigate("/student/join")}
          className="game-font bg-cyan-500 hover:bg-cyan-400 text-slate-900 py-3 px-6 rounded-xl transition"
        >
          Go to Join Page
        </button>
      </div>
    );
  }

  const totalPoints = state.totalPoints ?? 0;
  const answersStatus = Array.isArray(state.answersStatus) ? state.answersStatus : [];
  const totalQuestions = state.totalQuestions ?? answersStatus.length ?? 3;

  // ✅ نفس اللاعبين الذين في الاختبار (قادمين من Lobby)
  const players = Array.isArray(state.players) ? state.players : ["Radi", "Sara", "Fahad", state.studentName];

  // Prototype: scores for other players (deterministic-ish)
  const otherScores = players
    .filter((n) => n !== state.studentName)
    .map((name, i) => ({
      name,
      score: Math.max(0, totalPoints + (i % 2 === 0 ? 40 : -30) - i * 10),
    }));

  const leaderboard = [...otherScores, { name: state.studentName, score: totalPoints }]
    .sort((a, b) => b.score - a.score);

  const rank = leaderboard.findIndex((x) => x.name === state.studentName) + 1;
  const rightList = leaderboard.slice(0, Math.min(leaderboard.length, 10));

  const correctCount = answersStatus.filter((x) => x === true).length;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* LEFT: question status */}
      <div className="w-28 md:w-36 p-4 flex flex-col gap-4 items-center justify-center border-r border-slate-700 bg-slate-900">
        {Array.from({ length: totalQuestions }).map((_, i) => {
          const ok = answersStatus[i] === true;
          const wrong = answersStatus[i] === false;

          return (
            <div
              key={i}
              className={[
                "w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-xl shadow",
                ok ? "bg-emerald-400" : wrong ? "bg-red-500" : "bg-slate-600",
              ].join(" ")}
            >
              <span className="game-font text-4xl text-white">{i + 1}</span>
            </div>
          );
        })}
      </div>

      {/* CENTER */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-900">
        <div className="w-full max-w-2xl bg-slate-800 border border-slate-600 rounded-2xl shadow-xl p-8 text-center">
          <h1 className="game-font text-4xl md:text-5xl text-cyan-300 mb-8">
            Quiz Answer Results
          </h1>

          <div className="mx-auto bg-emerald-400 rounded-[40px] shadow-2xl px-8 py-10 text-slate-900 max-w-xl">
            <h2 className="game-font text-5xl text-white mb-6">{state.studentName}</h2>

            <p className="game-font text-3xl text-white">Total Score: {totalPoints}</p>

            <p className="mt-6 text-white font-semibold">
              Correct answers: {correctCount}/{totalQuestions}
            </p>

            <p className="mt-3 text-white font-semibold">Rank: #{rank}</p>

            <button
              onClick={() => navigate("/student/join")}
              className="w-full mt-6 game-font bg-yellow-300 hover:bg-yellow-200 text-slate-900 py-3 rounded-xl transition"
            >
              Join Another Quiz
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: leaderboard */}
      <aside className="w-72 md:w-80 bg-slate-900 border-l border-slate-700 p-6 overflow-y-auto">
        <h2 className="game-font text-2xl mb-4 text-pink-300">Current Leaderboard</h2>

        <div className="space-y-3">
          {rightList.map((p, idx) => (
            <div
              key={`${p.name}-${idx}`}
              className="bg-emerald-700/80 hover:bg-emerald-700 border border-emerald-300/20 rounded-2xl px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🎖️"}
                </span>
                <span className="game-font text-lg text-white">{p.name}</span>
              </div>
              <span className="text-yellow-300 font-semibold">{p.score}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default FinalResults;