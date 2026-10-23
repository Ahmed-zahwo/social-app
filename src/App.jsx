
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";

function ProtectedRoute() {
  const token = localStorage.getItem("token");

  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function GuestRoute() {
  const token = localStorage.getItem("token");

  return token ? <Navigate to="/" replace /> : <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
