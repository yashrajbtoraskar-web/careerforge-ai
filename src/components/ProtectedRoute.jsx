import { Navigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export function ProtectedRoute({ children }) {
  const { session } = useStore();
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { session, isAdmin } = useStore();
  if (!session) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}
