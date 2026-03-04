import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function SessionOfficial() {
  // Generate a mock code once
  const gameCode = useMemo(() => {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const nums = "23456789";
    const pick = (s) => s[Math.floor(Math.random() * s.length)];
    return `${pick(letters)}${pick(letters)}${pick(nums)}${pick(nums)}`;
  }, []);

  const [status, setStatus] = useState("Waiting"); // Waiting | Live | Ended
  const [players, setPlayers] = useState([
    { name: "Sara", joinedAt: "00:02" },
    { name: "Fahad", joinedAt: "00:06" },
  ]);

  // Prototype: auto-add players while Waiting
  useEffect(() => {
    if (status !== "Waiting") return;

    const pool = ["Radi", "Nora", "Ali", "Hanan", "Omar"];
    let i = 0;

    const id = setInterval(() => {
      if (i >= pool.length) {
        clearInterval(id);
        return;
      }
      setPlayers((prev) => [...prev, { name: pool[i], joinedAt: `00:${10 + i * 2}` }]);
      i += 1;
    }, 2500);

    return () => clearInterval(id);
  }, [status]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 min-h-screen bg-white border-r border-slate-200 p-6 hidden md:block">
          <div className="mb-8">
            <h1 className="text-xl font-bold">Quiz Play</h1>
            <p className="text-sm text-slate-500 mt-1">Instructor Panel</p>
          </div>

          <nav className="space-y-2">
            <Link
              to="/instructor/dashboard-official"
              className="block px-4 py-3 rounded-xl hover:bg-slate-100 text-slate-700"
            >
              Dashboard
            </Link>

            <Link
              to="/instructor/session-official"
              className="block px-4 py-3 rounded-xl bg-slate-900 text-white"
            >
              Sessions
            </Link>

            <div className="block px-4 py-3 rounded-xl text-slate-400 cursor-not-allowed">
              Quizzes (soon)
            </div>

            <div className="block px-4 py-3 rounded-xl text-slate-400 cursor-not-allowed">
              Analytics (soon)
            </div>
          </nav>

          <div className="mt-10">
            <Link
              to="/"
              className="block text-center px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50"
            >
              Back to Home
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold">Session</h2>
              <p className="text-slate-500 mt-1">
                Share this code with students and control the quiz.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                to="/instructor/session"
                className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-white transition"
              >
                Game Style View
              </Link>
              <Link
                to="/instructor/dashboard-official"
                className="px-5 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Code + status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:col-span-2">
              <p className="text-slate-500 text-sm">Game Code</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="text-4xl font-black tracking-widest">{gameCode}</div>
                <button
                  onClick={() => navigator.clipboard.writeText(gameCode)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 transition"
                >
                  Copy
                </button>
              </div>
              <p className="text-slate-500 text-sm mt-3">
                Students will join using this code.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <p className="text-slate-500 text-sm">Status</p>
              <p className="text-2xl font-bold mt-2">{status}</p>
              <p className="text-slate-500 text-sm mt-2">
                {status === "Waiting"
                  ? "Waiting for students..."
                  : status === "Live"
                  ? "Quiz is running."
                  : "Session ended."}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            <button
              onClick={() => setStatus("Live")}
              disabled={status !== "Waiting"}
              className={[
                "px-5 py-3 rounded-xl font-semibold transition",
                status === "Waiting"
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed",
              ].join(" ")}
            >
              Start
            </button>

            <button
              onClick={() => alert("Prototype: Next question")}
              disabled={status !== "Live"}
              className={[
                "px-5 py-3 rounded-xl font-semibold transition",
                status === "Live"
                  ? "bg-white border border-slate-300 hover:bg-slate-50"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed",
              ].join(" ")}
            >
              Next
            </button>

            <button
              onClick={() => setStatus("Ended")}
              disabled={status === "Ended"}
              className={[
                "px-5 py-3 rounded-xl font-semibold transition",
                status !== "Ended"
                  ? "bg-red-500 text-white hover:bg-red-400"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed",
              ].join(" ")}
            >
              End
            </button>
          </div>

          {/* Players table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Players</h3>
              <span className="text-slate-500 text-sm">{players.length} joined</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 text-sm border-b border-slate-200">
                    <th className="py-3 pr-3">Name</th>
                    <th className="py-3 pr-3">Joined at</th>
                    <th className="py-3 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, idx) => (
                    <tr key={`${p.name}-${idx}`} className="border-b border-slate-100">
                      <td className="py-3 pr-3 font-medium">{p.name}</td>
                      <td className="py-3 pr-3 text-slate-500">{p.joinedAt}</td>
                      <td className="py-3 pr-3">
                        <span className="inline-block px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-600">
                          Connected
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile quick nav */}
          <div className="md:hidden mt-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3">
              <Link
                to="/instructor/dashboard-official"
                className="flex-1 text-center px-4 py-3 rounded-xl border border-slate-300"
              >
                Dashboard
              </Link>
              <Link
                to="/instructor/session-official"
                className="flex-1 text-center px-4 py-3 rounded-xl bg-slate-900 text-white"
              >
                Sessions
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default SessionOfficial;