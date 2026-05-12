import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import { AUTH_STORAGE_KEY } from "./constants/auth";
import Landing from "./pages/Landing";

export default function App() {
  const PASSPHRASE_STORAGE_KEY = "vault_passphrase_session";
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
  const [vaultPassphrase, setVaultPassphrase] = useState(() => sessionStorage.getItem(PASSPHRASE_STORAGE_KEY) || "");

  const handleAuthSuccess = (nextAuth, loginPassword) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
    sessionStorage.setItem(PASSPHRASE_STORAGE_KEY, loginPassword);
    setAuth(nextAuth);
    setVaultPassphrase(loginPassword);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(PASSPHRASE_STORAGE_KEY);
    setAuth(null);
    setVaultPassphrase("");
  };

  const isAuthenticated = Boolean(auth && vaultPassphrase);

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/app/text" : "/login"} replace />}
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/app/text" replace />
          ) : (
            <Landing onAuthSuccess={handleAuthSuccess} />
          )
        }
      />
      <Route
        path="/app/:section"
        element={
          <ProtectedRoute isAllowed={isAuthenticated}>
            <AppShell onLogout={handleLogout} auth={auth} vaultPassphrase={vaultPassphrase} />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/app/text" : "/login"} replace />}
      />
    </Routes>
  );
}
