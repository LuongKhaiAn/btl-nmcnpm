import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import AdminPage from "./pages/admin-page/admin-page";
import BookingPage from "./pages/booking-page/booking-page";
import CustomerPage from "./pages/customer-page/customer-page";
import HomePage from "./pages/home-page/home-page";
import LoginPage from "./pages/login-page/login-page";
import RegisterPage from "./pages/register-page/register-page";
import { isAdmin, isCustomer } from "./utils/auth";

function AdminRoute({ children }) {
  if (!isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function CustomerRoute({ children }) {
  if (!isCustomer()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/account"
          element={
            <CustomerRoute>
              <CustomerPage />
            </CustomerRoute>
          }
        />
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
