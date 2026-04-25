import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

function CreateSession() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const user = auth.currentUser;

      const sessionData = {
        title,
        createdAt: serverTimestamp(),
      };

      if (user) {
        await addDoc(collection(db, "sessions"), {
          ...sessionData,
          ownerUid: user.uid,
          ownerEmail: user.email,
          isGuest: false,
        });

        setMessage("Session created and saved to Firebase.");
      } else {
        setMessage("Session created locally only. Login to save your work.");
      }

      setTitle("");
    } catch (error) {
      console.error("Create session error:", error);
      setMessage("Something went wrong while creating the session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-lg bg-slate-800 rounded-2xl shadow-xl p-8">
        <h1 className="game-font text-3xl mb-6 text-center">Create Session</h1>

        <form onSubmit={handleCreateSession} className="space-y-4">
          <div>
            <label className="block mb-2">Session Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter session title"
              className="w-full p-3 rounded-xl bg-slate-700 text-white outline-none border border-slate-600 focus:border-cyan-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-700 text-slate-900 font-bold py-3 rounded-xl transition"
          >
            {loading ? "Creating..." : "Create Session"}
          </button>

          {message && (
            <p className="text-sm text-slate-300 text-center">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default CreateSession;