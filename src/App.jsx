import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import JoinGame from "./pages/student/JoinGame";
import Lobby from "./pages/student/Lobby";
import Question from "./pages/student/Question";
import Result from "./pages/student/Result";
import Leaderboard from "./pages/student/Leaderboard";
import DashboardOfficial from "./pages/instructor/DashboardOfficial";
import SessionOfficial from "./pages/instructor/SessionOfficial";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student/join" element={<JoinGame />} />
        <Route path="/student/lobby" element={<Lobby />} />
        <Route path="/student/question" element={<Question />} />
        <Route path="/student/result" element={<Result />} />
        <Route path="/student/leaderboard" element={<Leaderboard />} />
        <Route path="/instructor/dashboard-official" element={<DashboardOfficial />} />
        <Route path="/instructor/session-official" element={<SessionOfficial />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;