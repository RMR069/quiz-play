import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="game-font text-5xl md:text-6xl text-pink-300 mb-4">
            Instructor
          </h1>
          <p className="text-slate-300">
            Manage sessions and create quizzes (prototype).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/instructor/session">
            <div className="bg-slate-800 hover:bg-slate-700 transition rounded-2xl p-6 shadow-lg border border-slate-600 cursor-pointer">
              <h2 className="game-font text-2xl text-yellow-300 mb-2">
                Create Session
              </h2>
              <p className="text-slate-300 text-sm">
                Generate a game code and start the quiz.
              </p>
            </div>
          </Link>

          <div className="bg-slate-800 opacity-70 rounded-2xl p-6 shadow-lg border border-slate-600">
            <h2 className="game-font text-2xl text-cyan-300 mb-2">
              My Quizzes
            </h2>
            <p className="text-slate-300 text-sm">
              Coming soon (AI/PDF + quiz builder).
            </p>
          </div>

          <div className="bg-slate-800 opacity-70 rounded-2xl p-6 shadow-lg border border-slate-600">
            <h2 className="game-font text-2xl text-green-300 mb-2">
              Analytics
            </h2>
            <p className="text-slate-300 text-sm">
              Coming soon (results & insights).
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/">
            <button className="bg-transparent border border-slate-600 hover:bg-slate-700 py-3 px-6 rounded-xl transition">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;