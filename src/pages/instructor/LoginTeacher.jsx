import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";

function LoginTeacher() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const getFirebaseLoginErrorMessage = (code) => {
    switch (code) {
      case "auth/invalid-email":
        return "The email format is invalid.";
      case "auth/missing-password":
        return "Please enter your password.";
      case "auth/invalid-credential":
        return "Incorrect email or password, or this account does not exist.";
      case "auth/user-not-found":
        return "No account was found with this email.";
      case "auth/wrong-password":
        return "The password is incorrect.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Try again later.";
      case "auth/network-request-failed":
        return "Network error. Check your internet connection.";
      case "auth/internal-error":
        return "Internal authentication error. Please try again.";
      case "auth/operation-not-allowed":
        return "Email/Password sign-in is not enabled in Firebase.";
      default:
        return "Login failed. Please try again.";
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setErrorCode("");
    setLoading(true);

    if (!email.trim()) {
      setError("Please enter your email.");
      setErrorCode("custom/missing-email");
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      setErrorCode("custom/missing-password");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCredential.user;

      await setDoc(
        doc(db, "teachers", user.uid),
        {
          uid: user.uid,
          email: user.email,
          role: "teacher",
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );

      navigate("/instructor/dashboard-official");
    } catch (err) {
      console.error("Login error:", err);
      setErrorCode(err.code || "unknown");
      setError(getFirebaseLoginErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl p-8">
        <h1 className="game-font text-3xl text-center text-white mb-2">
          Instructor Login
        </h1>

        <p className="text-slate-300 text-center mb-6">
          Sign in to save your work and manage your sessions
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-white mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-700 text-white outline-none border border-slate-600 focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-700 text-white outline-none border border-slate-600 focus:border-cyan-400"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/40 bg-red-500/10 p-3">
              <p className="text-red-300 text-sm font-medium">{error}</p>
              <p className="text-red-200/70 text-xs mt-1">
                Error code: {errorCode}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-700 text-slate-900 font-bold py-3 rounded-xl transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4">
          <Link
            to="/instructor/register"
            className="block w-full text-center bg-pink-500 hover:bg-pink-400 text-white font-bold py-3 rounded-xl transition"
          >
            Create New Account
          </Link>
        </div>

        <div className="mt-4 text-center">
          <p className="text-slate-400 text-sm">
            New here? Create an account first.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginTeacher;