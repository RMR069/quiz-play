import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../firebase";

function DashboardOfficial() {
  const navigate = useNavigate();

  const gameCode = useMemo(() => {
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const nums = "23456789";
    const pick = (s) => s[Math.floor(Math.random() * s.length)];
    return `${pick(letters)}${pick(letters)}${pick(nums)}${pick(nums)}`;
  }, []);

  const [selectedFile, setSelectedFile] = useState(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [timePerQuestion, setTimePerQuestion] = useState(5);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const studentsJoined = 0;

  const MIN_QUESTIONS = 5;
  const MAX_QUESTIONS = 20;

  const MIN_TIME = 5;
  const MAX_TIME = 30;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoggedIn(!!user);
      setError("");

      if (user) {
        setTeacherEmail(user.email || "");

        try {
          const teacherRef = doc(db, "teachers", user.uid);
          const teacherSnap = await getDoc(teacherRef);

          if (teacherSnap.exists()) {
            const data = teacherSnap.data();
            setTeacherName(data.fullName || data.name || "Instructor");
          } else {
            setTeacherName("Instructor");
          }
        } catch (err) {
          console.error("Failed to load teacher profile:", err);
          setTeacherName("Instructor");
        }
      } else {
        setTeacherName("");
        setTeacherEmail("");
      }
    });

    return () => unsubscribe();
  }, []);

  function increaseQuestions() {
    setQuestionCount((prev) => Math.min(prev + 5, MAX_QUESTIONS));
  }

  function decreaseQuestions() {
    setQuestionCount((prev) => Math.max(prev - 5, MIN_QUESTIONS));
  }

  function increaseTime() {
    setTimePerQuestion((prev) => Math.min(prev + 5, MAX_TIME));
  }

  function decreaseTime() {
    setTimePerQuestion((prev) => Math.max(prev - 5, MIN_TIME));
  }

  function generateMockQuestions(n, fileName) {
    const topic = fileName ? fileName.replace(/\.[^/.]+$/, "") : "General";

    const make = (difficultyLabel, baseQ) =>
      Array.from({ length: n }, (_, i) => ({
        id: `${difficultyLabel.toLowerCase()}-${i + 1}`,
        difficulty: difficultyLabel.toLowerCase(),
        q: `[${topic}] ${difficultyLabel} Q${i + 1}: ${baseQ} (${i + 1})`,
        choices: ["A", "B", "C", "D"],
        correctIndex: (i + 1) % 4,
      }));

    return {
      easy: make("Easy", "Basic concept question"),
      medium: make("Medium", "Applied concept question"),
      hard: make("Hard", "Challenging concept question"),
    };
  }

  async function handleGoToSession() {
    if (!selectedFile) return;

    try {
      setIsCreatingSession(true);
      setError("");
      setInfoMessage("");

      const questionsByDifficulty = generateMockQuestions(
        questionCount,
        selectedFile?.name
      );

      const user = auth.currentUser;

      if (user) {
        await setDoc(doc(db, "sessions", gameCode), {
          gameCode,
          fileName: selectedFile.name,
          questionCount,
          timePerQuestion,
          players: [],
          questionsByDifficulty,
          status: "waiting",
          createdAt: serverTimestamp(),
          ownerUid: user.uid,
          ownerEmail: user.email,
          ownerName: teacherName || "Instructor",
          isGuest: false,
        });

        setInfoMessage("Session saved successfully.");
      } else {
        setInfoMessage(
          "Guest mode: session is not saved. Log in if you want your work to be saved."
        );
      }

      navigate("/instructor/session-official", {
        state: {
          gameCode,
          fileName: selectedFile.name,
          questionCount,
          timePerQuestion,
          studentsJoined: 0,
          questionsByDifficulty,
          isGuest: !user,
        },
      });
    } catch (err) {
      console.error("Error creating session:", err);
      setError(`Failed to create session: ${err.message}`);
    } finally {
      setIsCreatingSession(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      setMenuOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      setError("Failed to log out. Please try again.");
    }
  }

  const displayName = teacherName || "Guest";
  const initials = displayName.trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="game-font text-4xl">Instructor Dashboard</h1>
            <p className="text-slate-500 mt-2">
              Manage quizzes, sessions, and instructor tools here.
            </p>
          </div>

          <div className="relative self-start lg:self-auto">
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {initials}
              </div>

              <div className="min-w-0 max-w-[160px]">
                <p className="font-semibold text-slate-900 truncate">
                  {displayName}
                </p>
                <p className="text-sm text-slate-500 truncate">
                  {isLoggedIn ? teacherEmail : "Guest Mode"}
                </p>
              </div>

              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-slate-50 transition flex items-center justify-center text-slate-700 text-sm shrink-0"
                aria-label="Open account menu"
              >
                ▼
              </button>
            </div>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-lg p-3 z-20">
                <div className="px-2 py-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-sm text-slate-500 truncate">
                    {isLoggedIn ? teacherEmail : "Guest Mode"}
                  </p>
                </div>

                <div className="pt-2">
                  {isLoggedIn ? (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 font-semibold transition"
                    >
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/instructor/login");
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-cyan-50 text-cyan-700 font-semibold transition"
                    >
                      Login
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {!isLoggedIn && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-amber-800">
            You are using guest mode. You can use the dashboard, but your work
            will not be saved unless you log in.
          </div>
        )}

        {infoMessage && (
          <div className="mb-6 rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-4 text-cyan-900">
            {infoMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Quiz Setup</h2>

            <div className="mb-8">
              <p className="text-sm font-semibold mb-3 text-slate-700">
                Upload File
              </p>

              <label className="block w-full rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-7 cursor-pointer hover:border-slate-300 hover:shadow-sm transition">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                />

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div>
                    <p className="font-semibold text-base">Select a file</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Upload PDF or learning material for the quiz.
                    </p>
                  </div>

                  <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm font-semibold w-fit shadow-sm">
                    Browse Files
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-white border border-slate-200 px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                    Selected File
                  </p>
                  <p className="font-medium text-sm md:text-base truncate">
                    {selectedFile ? selectedFile.name : "No file uploaded yet"}
                  </p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Number of Questions
                </p>

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={decreaseQuestions}
                    className="h-12 w-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 transition text-xl font-bold"
                  >
                    -
                  </button>

                  <div className="flex-1 rounded-2xl bg-white border border-slate-200 px-4 py-3 text-center">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Selected
                    </p>
                    <p className="text-2xl font-bold mt-1">{questionCount}</p>
                  </div>

                  <button
                    onClick={increaseQuestions}
                    className="h-12 w-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 transition text-xl font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Time per Question
                </p>

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={decreaseTime}
                    className="h-12 w-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 transition text-xl font-bold"
                  >
                    -
                  </button>

                  <div className="flex-1 rounded-2xl bg-white border border-slate-200 px-4 py-3 text-center">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Selected
                    </p>
                    <p className="text-2xl font-bold mt-1">{timePerQuestion}s</p>
                  </div>

                  <button
                    onClick={increaseTime}
                    className="h-12 w-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 transition text-xl font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-7 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Session Info
            </p>

            <div className="mt-6 rounded-3xl bg-slate-50 border border-slate-200 p-5 mb-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Game Code
              </p>
              <p className="text-3xl md:text-4xl font-extrabold tracking-[0.18em] mt-3 text-slate-900">
                {gameCode}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5 mb-6">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Students Joined
              </p>

              <div className="mt-3 flex items-end justify-between">
                <p className="text-4xl font-extrabold text-slate-900">
                  {studentsJoined}
                </p>
                <p className="text-sm text-slate-500">
                  {studentsJoined === 1 ? "student" : "students"}
                </p>
              </div>
            </div>

            <button
              onClick={handleGoToSession}
              disabled={!selectedFile || isCreatingSession}
              className={[
                "w-full px-5 py-3.5 rounded-2xl transition font-bold",
                selectedFile && !isCreatingSession
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed",
              ].join(" ")}
            >
              {isCreatingSession ? "Creating Session..." : "Go to Session"}
            </button>

            <p className="text-xs text-slate-500 mt-4 leading-5">
              This will generate 3 difficulty banks. Saving to Firebase happens
              only when the instructor is logged in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOfficial;