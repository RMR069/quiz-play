import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const DIFFICULTY_TABS = [
  { key: "easy", label: "Easy" },
  { key: "medium", label: "Medium" },
  { key: "hard", label: "Hard" },
];

function createEmptyQuestion(difficulty, index = 0) {
  return {
    id: `${difficulty}-manual-${Date.now()}-${index}`,
    difficulty,
    q: "",
    choices: ["", "", "", ""],
    correctIndex: 0,
  };
}

function normalizeQuestionsByDifficulty(value) {
  return {
    easy: Array.isArray(value?.easy) ? value.easy : [],
    medium: Array.isArray(value?.medium) ? value.medium : [],
    hard: Array.isArray(value?.hard) ? value.hard : [],
  };
}

function QuestionsPreview() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const gameCode = state?.gameCode ?? "";
  const [difficulty, setDifficulty] = useState("easy");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [questionsByDifficulty, setQuestionsByDifficulty] = useState({
    easy: [],
    medium: [],
    hard: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [sessionExistsInFirestore, setSessionExistsInFirestore] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      if (!gameCode) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError("");

      try {
        const localKey = `quizplay_session_${gameCode}`;
        const raw = localStorage.getItem(localKey);
        const localSession = raw ? JSON.parse(raw) : null;

        if (localSession && isMounted) {
          setSessionInfo(localSession);
          setQuestionsByDifficulty(
            normalizeQuestionsByDifficulty(localSession.questionsByDifficulty)
          );
        }

        const sessionRef = doc(db, "sessions", gameCode);
        const snapshot = await getDoc(sessionRef);

        if (snapshot.exists()) {
          const remoteSession = { gameCode, ...snapshot.data() };

          if (!isMounted) {
            return;
          }

          setSessionExistsInFirestore(true);
          setSessionInfo(remoteSession);
          setQuestionsByDifficulty(
            normalizeQuestionsByDifficulty(remoteSession.questionsByDifficulty)
          );
          localStorage.setItem(localKey, JSON.stringify(remoteSession));
        } else if (!localSession && isMounted) {
          setLoadError("Session data could not be found.");
        }
      } catch (error) {
        console.error("Failed to load questions:", error);

        if (!isMounted) {
          return;
        }

        setLoadError("Failed to load the question bank.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [gameCode]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [difficulty]);

  useEffect(() => {
    if (!saveMessage) {
      return undefined;
    }

    const timeoutId = setTimeout(() => setSaveMessage(""), 2500);
    return () => clearTimeout(timeoutId);
  }, [saveMessage]);

  const list = questionsByDifficulty[difficulty] ?? [];
  const safeSelectedIndex = useMemo(() => {
    if (!list.length) return 0;
    return Math.min(selectedIndex, list.length - 1);
  }, [list.length, selectedIndex]);
  const currentSafe = list[safeSelectedIndex];
  const totalQuestions = DIFFICULTY_TABS.reduce(
    (sum, tab) => sum + (questionsByDifficulty[tab.key]?.length ?? 0),
    0
  );

  function updateCurrentQuestion(updater) {
    setQuestionsByDifficulty((prev) => {
      const updatedList = [...(prev[difficulty] ?? [])];

      if (!updatedList[safeSelectedIndex]) {
        return prev;
      }

      updatedList[safeSelectedIndex] = updater(updatedList[safeSelectedIndex]);

      return {
        ...prev,
        [difficulty]: updatedList,
      };
    });
  }

  function handleChoiceChange(choiceIndex, value) {
    updateCurrentQuestion((question) => {
      const nextChoices = [...(question.choices ?? ["", "", "", ""])];
      nextChoices[choiceIndex] = value;

      return {
        ...question,
        choices: nextChoices,
      };
    });
  }

  function handleAddQuestion() {
    setQuestionsByDifficulty((prev) => {
      const nextList = [...(prev[difficulty] ?? [])];
      nextList.push(createEmptyQuestion(difficulty, nextList.length + 1));

      return {
        ...prev,
        [difficulty]: nextList,
      };
    });

    setSelectedIndex(list.length);
  }

  function handleDeleteQuestion() {
    if (!list.length) {
      return;
    }

    setQuestionsByDifficulty((prev) => {
      const nextList = (prev[difficulty] ?? []).filter(
        (_, index) => index !== safeSelectedIndex
      );

      return {
        ...prev,
        [difficulty]: nextList,
      };
    });

    setSelectedIndex((prev) => Math.max(0, prev - 1));
  }

  async function handleSaveQuestions() {
    if (!gameCode) {
      return;
    }

    const nextSession = {
      ...(sessionInfo ?? {}),
      gameCode,
      questionsByDifficulty,
    };

    setIsSaving(true);
    setLoadError("");

    try {
      localStorage.setItem(
        `quizplay_session_${gameCode}`,
        JSON.stringify(nextSession)
      );

      if (sessionExistsInFirestore) {
        await updateDoc(doc(db, "sessions", gameCode), {
          questionsByDifficulty,
        });
      }

      setSessionInfo(nextSession);
      setSaveMessage("Questions saved successfully.");
    } catch (error) {
      console.error("Failed to save questions:", error);
      setLoadError("Failed to save the updated questions.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!state?.gameCode) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">No session found</h1>
          <p className="text-slate-500 mb-6">Go back to Session page first.</p>
          <button
            onClick={() => navigate("/instructor/session-official")}
            className="w-full px-5 py-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition font-bold"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-slate-700 text-xl font-semibold">
          Loading questions...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Question Bank Manager</h1>
            <p className="text-slate-500 mt-1">
              Game Code: <span className="font-semibold">{gameCode}</span>
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Add questions manually and edit the generated ones before starting.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSaveQuestions}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition font-semibold disabled:bg-slate-400"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition font-semibold"
            >
              Back
            </button>
          </div>
        </div>

        {loadError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {loadError}
          </div>
        )}

        {saveMessage && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-700">
            {saveMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {DIFFICULTY_TABS.map((tab) => (
            <div
              key={tab.key}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs uppercase tracking-widest text-slate-500">
                {tab.label}
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {questionsByDifficulty[tab.key]?.length ?? 0}
              </p>
            </div>
          ))}

          <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-cyan-700">
              Total Bank
            </p>
            <p className="mt-2 text-3xl font-bold text-cyan-950">
              {totalQuestions}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {DIFFICULTY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setDifficulty(tab.key)}
              className={[
                "px-4 py-2 rounded-2xl border transition font-semibold",
                difficulty === tab.key
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white border-slate-200 hover:bg-slate-50",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 h-[620px] overflow-y-auto">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">
              Questions ({list.length})
            </p>

            <button
              onClick={handleAddQuestion}
              className="w-full mb-3 px-4 py-3 rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-900 hover:bg-cyan-100 transition font-semibold"
            >
              + Add Question
            </button>

            <div className="space-y-2">
              {list.map((question, index) => (
                <button
                  key={question.id ?? `${difficulty}-${index}`}
                  onClick={() => setSelectedIndex(index)}
                  className={[
                    "w-full text-left px-4 py-3 rounded-2xl border transition",
                    safeSelectedIndex === index
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white border-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <div className="font-semibold">Q{index + 1}</div>
                  <div className="text-sm opacity-80 truncate">
                    {question.q || "Untitled question"}
                  </div>
                </button>
              ))}
            </div>

            {list.length === 0 && (
              <div className="text-slate-500 text-sm mt-3">
                No questions found in this difficulty yet.
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6">
            {!currentSafe ? (
              <div className="text-slate-500">
                Add a question to start building this difficulty bank.
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    {difficulty.toUpperCase()} - Question {safeSelectedIndex + 1}
                  </p>

                  <button
                    onClick={handleDeleteQuestion}
                    className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition font-semibold"
                  >
                    Delete Question
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Question Text
                    </label>
                    <textarea
                      value={currentSafe.q ?? ""}
                      onChange={(event) =>
                        updateCurrentQuestion((question) => ({
                          ...question,
                          q: event.target.value,
                          difficulty,
                        }))
                      }
                      rows={4}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400"
                      placeholder="Write the question here"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(currentSafe.choices || ["", "", "", ""]).map((choice, index) => {
                      const isCorrect = index === currentSafe.correctIndex;

                      return (
                        <div
                          key={`${difficulty}-choice-${index}`}
                          className={[
                            "rounded-2xl border px-4 py-4",
                            isCorrect
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-slate-200 bg-slate-50",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <span className="font-semibold text-slate-700">
                              Choice {String.fromCharCode(65 + index)}
                            </span>

                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                              <input
                                type="radio"
                                name={`correct-${difficulty}-${safeSelectedIndex}`}
                                checked={isCorrect}
                                onChange={() =>
                                  updateCurrentQuestion((question) => ({
                                    ...question,
                                    correctIndex: index,
                                  }))
                                }
                              />
                              Correct
                            </label>
                          </div>

                          <input
                            type="text"
                            value={choice}
                            onChange={(event) =>
                              handleChoiceChange(index, event.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-cyan-400"
                            placeholder={`Enter choice ${String.fromCharCode(65 + index)}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionsPreview;
