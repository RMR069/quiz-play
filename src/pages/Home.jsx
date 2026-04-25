import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-6 relative">
      {/* Top left login icon */}
      <Link
        to="/instructor/login"
        className="absolute top-4 left-4 bg-slate-800 hover:bg-slate-700 transition rounded-xl p-3 shadow-lg border border-slate-600"
        aria-label="Go to instructor login"
      >
        <span className="text-xl">👤</span>
      </Link>

      <div className="w-full max-w-3xl text-center">
        <h1 className="game-font text-5xl md:text-7xl text-yellow-300 mb-6">
          Quiz Play
        </h1>

        <p className="text-slate-300 text-lg md:text-xl mb-10">
          Choose your role and start the game experience
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/student/join">
            <div className="bg-slate-800 hover:bg-slate-700 transition rounded-2xl p-8 shadow-lg border border-slate-600 cursor-pointer">
              <h2 className="game-font text-3xl text-cyan-300 mb-4">Student</h2>
              <p className="text-slate-300">
                Join a live quiz, answer questions, and compete with others.
              </p>
            </div>
          </Link>

          <Link to="/instructor/dashboard-official">
            <div className="bg-slate-800 hover:bg-slate-700 transition rounded-2xl p-8 shadow-lg border border-slate-600 cursor-pointer">
              <h2 className="game-font text-3xl text-pink-300 mb-4">Instructor</h2>
              <p className="text-slate-300">
                Create quizzes, manage sessions, and track student performance.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;