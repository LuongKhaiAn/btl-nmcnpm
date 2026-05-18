import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import AdminPage from "./pages/admin-page/admin-page";
import HomePage from "./pages/home-page/home-page";
import LoginPage from "./pages/login-page/login-page";
import { isAdmin } from "./utils/auth";

function AdminRoute({ children }) {
  if (!isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
