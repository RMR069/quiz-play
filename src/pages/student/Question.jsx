import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Question() {
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

  const { studentName, gameCode } = state;

  const questions = useMemo(
    () => [
      {
        text: "Which protocol is used to transfer web pages?",
        choices: ["FTP", "HTTP", "SMTP", "SSH"],
        correctIndex: 1,
        durationSeconds: 15,
      },
      {
        text: "Which HTML tag is used for the largest heading?",
        choices: ["<h6>", "<head>", "<h1>", "<title>"],
        correctIndex: 2,
        durationSeconds: 15,
      },
      {
        text: "In JavaScript, which keyword declares a block-scoped variable?",
        choices: ["var", "let", "function", "define"],
        correctIndex: 1,
        durationSeconds: 15,
      },
    ],
    []
  );

  const total = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];

  const [score, setScore] = useState(0);

  const [timeLeft, setTimeLeft] = useState(currentQuestion.durationSeconds);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [locked, setLocked] = useState(false);

  // Reset state when moving to a new question
  useEffect(() => {
    setTimeLeft(currentQuestion.durationSeconds);
    setSelectedIndex(null);
    setLocked(false);
  }, [currentIndex, currentQuestion.durationSeconds]);

  // Timer
  useEffect(() => {
    if (locked) return;

    if (timeLeft <= 0) {
      setLocked(true);
      return;
    }

    const id = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(id);
  }, [timeLeft, locked]);

  function chooseAnswer(index) {
    if (locked) return;
    setSelectedIndex(index);
    setLocked(true);
  }

  function next() {
    // Add score only if the player selected an answer and it is correct
    if (selectedIndex !== null && selectedIndex === currentQuestion.correctIndex) {
      setScore((s) => s + 1);
    }

    // Move to next question or finish
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    // Finish: navigate to Result screen
    const finalScore =
      score + (selectedIndex !== null && selectedIndex === currentQuestion.correctIndex ? 1 : 0);

    navigate("/student/result", {
      state: { studentName, gameCode, score: finalScore, total },
    });
  }

  const progress = Math.max(0, (timeLeft / currentQuestion.durationSeconds) * 100);

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 py-8">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="game-font text-3xl text-cyan-300">Quiz</h1>
          <p className="text-slate-300 mt-1">
            Player: <span className="text-white font-semibold">{studentName}</span> •
            Code: <span className="text-yellow-300 game-font"> {gameCode}</span>
          </p>
          <p className="text-slate-300 mt-1">
            Score: <span className="text-white font-semibold">{score}</span>
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-600 rounded-2xl px-5 py-4 text-center">
          <p className="text-slate-300 text-sm">Time Left</p>
          <p className="game-font text-3xl text-yellow-300">{timeLeft}s</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-6">
        <div className="h-3 w-full bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-slate-800 border border-slate-600 rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-300">
            Question <span className="text-white font-semibold">{currentIndex + 1}</span> /{" "}
            {total}
          </p>
          <span className="text-slate-300 text-sm">
            {locked ? "Answer locked" : "Choose one answer"}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold mb-8">
          {currentQuestion.text}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.choices.map((c, i) => {
            const isSelected = selectedIndex === i;

            return (
              <button
                key={`${currentIndex}-${c}-${i}`}
                onClick={() => chooseAnswer(i)}
                disabled={locked}
                className={[
                  "text-left rounded-2xl p-5 border transition",
                  locked ? "cursor-not-allowed opacity-90" : "hover:bg-slate-700",
                  isSelected
                    ? "bg-slate-700 border-cyan-300"
                    : "bg-slate-900 border-slate-700",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <span className="game-font text-xl text-yellow-300">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  <span className="text-white">{c}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-3">
          <button
            onClick={() => navigate("/student/lobby", { state })}
            className="w-full md:w-auto bg-transparent border border-slate-600 hover:bg-slate-700 py-3 px-6 rounded-xl transition"
          >
            Back to Lobby
          </button>

          <button
            onClick={next}
            className="w-full md:flex-1 game-font bg-yellow-300 hover:bg-yellow-200 text-slate-900 py-3 rounded-xl transition"
          >
            {currentIndex === total - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Question;