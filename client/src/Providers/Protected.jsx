import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }) {
  const Token = Cookies.get("address");
  return Token ? children : <Navigate to="/desc" replace />;
}

export function ProtectedRouteSession({ children }) {
  const isConnected = sessionStorage.getItem("connected");
  return isConnected ? children : <Navigate to="/" replace />;
}
