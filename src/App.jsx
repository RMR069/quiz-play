import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import JoinGame from "./pages/student/JoinGame";
import Dashboard from "./pages/instructor/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student/join" element={<JoinGame />} />
        <Route path="/instructor/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;