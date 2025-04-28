import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import BukuPage from "./pages/BukuPage";
import UserPage from "./pages/UserPage";
import StatusBukuPage from "./pages/StatusBukuPage";
import KategoriPage from "./pages/KategoriPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/kategori" element={<KategoriPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/buku" element={<BukuPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/statusbuku" element={<StatusBukuPage />} />
      </Routes>
    </Router>
  );
}

export default App;
