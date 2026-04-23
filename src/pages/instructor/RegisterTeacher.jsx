import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

function RegisterTeacher() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const getFirebaseRegisterErrorMessage = (code) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "This email is already in use.";
      case "auth/invalid-email":
        return "The email format is invalid.";
      case "auth/weak-password":
        return "The password is too weak. Use at least 6 characters.";
      case "auth/operation-not-allowed":
        return "Email/Password sign-up is not enabled in Firebase.";
      case "auth/network-request-failed":
        return "Network error. Check your internet connection.";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later.";
      default:
        return "Account creation failed. Please try again.";
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setErrorCode("");
    setLoading(true);

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      setErrorCode("custom/missing-name");
      setLoading(false);
      return;
    }

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

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setErrorCode("custom/weak-password");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setErrorCode("custom/password-mismatch");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "teachers", user.uid), {
        uid: user.uid,
        fullName: fullName.trim(),
        email: user.email,
        role: "teacher",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });

      navigate("/instructor/dashboard-official");
    } catch (err) {
      console.error("Register error:", err);
      setErrorCode(err.code || "unknown");
      setError(getFirebaseRegisterErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl p-8">
        <h1 className="game-font text-3xl text-center text-white mb-2">
          Create Instructor Account
        </h1>

        <p className="text-slate-300 text-center mb-6">
          Create an account to save your quizzes and sessions
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-white mb-2">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-700 text-white outline-none border border-slate-600 focus:border-cyan-400"
              required
            />
          </div>

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

          <div>
            <label className="block text-white mb-2">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            className="w-full bg-pink-500 hover:bg-pink-400 disabled:bg-pink-700 text-white font-bold py-3 rounded-xl transition"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-300 text-sm">
            Already have an account?{" "}
            <Link
              to="/instructor/login"
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterTeacher;