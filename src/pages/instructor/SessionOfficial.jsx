import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../firebase";

function SessionOfficial() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const gameCode = state?.gameCode || "";
  const localSessionKey = gameCode ? `quizplay_session_${gameCode}` : "";
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copyMessage, setCopyMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [authError, setAuthError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const fallbackSession = useMemo(() => {
    if (gameCode && localSessionKey) {
      try {
        const raw = localStorage.getItem(localSessionKey);
        const parsed = raw ? JSON.parse(raw) : null;

        if (parsed) {
          return parsed;
        }
      } catch (error) {
        console.error("Failed to read local session:", error);
      }
    }

    if (!state || !gameCode) {
      return null;
    }

    return {
      gameCode,
      fileName: state.fileName,
      questionCount: state.questionCount,
      timePerQuestion: state.timePerQuestion,
      players: state.students || [],
      questionsByDifficulty: state.questionsByDifficulty,
      isGuest: state.isGuest ?? false,
      localOnly: state.localOnly ?? false,
    };
  }, [gameCode, localSessionKey, state]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setIsLoggedIn(!!user);
      setAuthError("");

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
        } catch (error) {
          console.error("Failed to load teacher profile:", error);
          setTeacherName("Instructor");
        }
      } else {
        setTeacherName("");
        setTeacherEmail("");
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!gameCode) {
      return;
    }

    const sessionRef = doc(db, "sessions", gameCode);

    const unsubscribeSession = onSnapshot(
      sessionRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setSessionData(snapshot.data());
        } else if (fallbackSession) {
          setSessionData(fallbackSession);
        } else {
          setSessionData(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error reading session:", error);
        setSessionData(fallbackSession);
        setLoading(false);
      }
    );

    return () => unsubscribeSession();
  }, [fallbackSession, gameCode]);

  const isMissingGameCode = !gameCode;
  const isPageLoading = !isMissingGameCode && loading;

  if (isMissingGameCode) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            No session data found
          </h1>
          <p className="text-slate-500 mb-6">
            Please go back to the setup page and create a session first.
          </p>
          <button
            onClick={() => navigate("/instructor/dashboard-official")}
            className="w-full px-5 py-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition font-bold"
          >
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-slate-700 text-xl font-semibold">
          Loading session...
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Session not found
          </h1>
          <p className="text-slate-500 mb-6">
            This session does not exist in Firebase.
          </p>
          <button
            onClick={() => navigate("/instructor/dashboard-official")}
            className="w-full px-5 py-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition font-bold"
          >
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  const fileName = sessionData.fileName ?? "No file uploaded";
  const questionCount = sessionData.questionCount ?? 5;
  const timePerQuestion = sessionData.timePerQuestion ?? 5;
  const students = Array.isArray(sessionData.players) ? sessionData.players : [];
  const isLocalOnlySession = Boolean(sessionData.localOnly);
  const joinUrl = `${window.location.origin}${import.meta.env.BASE_URL}student/join?code=${gameCode}`;

  const displayName = teacherName || "Guest";
  const initials = displayName.trim().charAt(0).toUpperCase();

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopyMessage("Link copied!");
      setTimeout(() => setCopyMessage(""), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      setCopyMessage("Copy failed.");
      setTimeout(() => setCopyMessage(""), 2000);
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      setMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      setAuthError("Failed to log out. Please try again.");
    }
  }

  function handleStartQuiz() {
    if (students.length === 0) return;

    navigate("/instructor/questions-preview", {
      state: {
        gameCode,
        fileName,
        questionCount,
        timePerQuestion,
        students,
      },
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="game-font text-4xl">Session</h1>
            <p className="text-slate-500 mt-2">
              Manage your current quiz session and see joined students.
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
            You are using guest mode. Your work will not be saved unless you log in.
          </div>
        )}

        {isLocalOnlySession && (
          <div className="mb-6 rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-4 text-cyan-900">
            This session is running from local temporary data, not Firebase. To make it available across devices, create it while logged in.
          </div>
        )}

        {authError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {authError}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Session Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                  File Name
                </p>
                <p className="font-semibold text-slate-900 break-words">
                  {fileName}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                  Game Code
                </p>
                <p className="text-2xl font-extrabold tracking-[0.15em] text-slate-900">
                  {gameCode}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                  Number of Questions
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {questionCount}
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                  Time per Question
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {timePerQuestion}s
                </p>
              </div>

              <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-3 text-center">
                  Join Link
                </p>

                <div className="rounded-2xl bg-white border border-slate-200 p-4 break-all text-sm text-slate-700">
                  {joinUrl}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    onClick={handleCopyLink}
                    className="px-5 py-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition font-semibold"
                  >
                    Copy Join Link
                  </button>

                  <button
                    onClick={() => navigate("/instructor/dashboard-official")}
                    className="px-5 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition font-semibold"
                  >
                    Back to Setup
                  </button>
                </div>

                {copyMessage && (
                  <p className="mt-3 text-sm text-green-600 font-medium">
                    {copyMessage}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-7 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Joined Students
            </p>

            <div className="mt-6 rounded-3xl bg-slate-50 border border-slate-200 p-5 mb-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Students Joined
              </p>

              <div className="mt-3 flex items-end justify-between">
                <p className="text-4xl font-extrabold text-slate-900">
                  {students.length}
                </p>
                <p className="text-sm text-slate-500">
                  {students.length === 1 ? "student" : "students"}
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 border border-slate-200 p-4 mb-5 max-h-72 overflow-y-auto">
              {students.length > 0 ? (
                <div className="space-y-3">
                  {students.map((student, index) => (
                    <div
                      key={`${student.name}-${index}`}
                      className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          {student.name || `Student ${index + 1}`}
                        </p>
                        <p className="text-xs text-slate-500">
                          Joined successfully
                        </p>
                      </div>

                      <div className="h-9 w-9 rounded-full bg-cyan-500 text-slate-900 flex items-center justify-center font-bold text-sm">
                        {(student.name || "S").charAt(0).toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">
                  No students have joined yet.
                </p>
              )}
            </div>

            <button
              onClick={handleStartQuiz}
              disabled={students.length === 0}
              className={[
                "w-full px-5 py-3.5 rounded-2xl transition font-bold",
                students.length > 0
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed",
              ].join(" ")}
            >
              Start Quiz
            </button>

            <p className="text-xs text-slate-500 mt-4 leading-5">
              Start becomes available when at least one student joins the session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionOfficial;
