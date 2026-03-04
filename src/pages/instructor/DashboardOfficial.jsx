import { Link } from "react-router-dom";

function DashboardOfficial() {
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
              className="block px-4 py-3 rounded-xl bg-slate-900 text-white"
            >
              Dashboard
            </Link>

            <Link
              to="/instructor/session-official"
              className="block px-4 py-3 rounded-xl hover:bg-slate-100 text-slate-700"
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
          {/* Topbar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <p className="text-slate-500 mt-1">
                Manage sessions, quizzes, and results.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                to="/instructor/session-official"
                className="px-5 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                Create Session
              </Link>
              <Link
                to="/instructor/dashboard"
                className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-white transition"
              >
                Game Style View
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <p className="text-slate-500 text-sm">Active Session</p>
              <p className="text-2xl font-bold mt-2">None</p>
              <p className="text-slate-500 text-sm mt-2">
                Create a new session to start.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <p className="text-slate-500 text-sm">Total Quizzes</p>
              <p className="text-2xl font-bold mt-2">0</p>
              <p className="text-slate-500 text-sm mt-2">
                Quiz builder will be added later.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <p className="text-slate-500 text-sm">Students Joined</p>
              <p className="text-2xl font-bold mt-2">0</p>
              <p className="text-slate-500 text-sm mt-2">
                Realtime data will come later.
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-lg">Sessions</h3>
              <p className="text-slate-500 mt-2">
                Create a session and share the game code with students.
              </p>
              <div className="mt-4">
                <Link
                  to="/instructor/session-official"
                  className="inline-block px-5 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
                >
                  Open Sessions
                </Link>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-lg">Quizzes</h3>
              <p className="text-slate-500 mt-2">
                Upload PDF / generate questions (coming soon).
              </p>
              <div className="mt-4">
                <button
                  disabled
                  className="px-5 py-3 rounded-xl bg-slate-200 text-slate-500 cursor-not-allowed"
                >
                  Quiz Builder (soon)
                </button>
              </div>
            </div>
          </div>

          {/* Mobile nav (simple) */}
          <div className="md:hidden mt-10">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex gap-3">
              <Link
                to="/instructor/dashboard-official"
                className="flex-1 text-center px-4 py-3 rounded-xl bg-slate-900 text-white"
              >
                Dashboard
              </Link>
              <Link
                to="/instructor/session-official"
                className="flex-1 text-center px-4 py-3 rounded-xl border border-slate-300"
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

export default DashboardOfficial;