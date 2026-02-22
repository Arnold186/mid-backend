import React from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Items from './pages/Items';
import Favorites from './pages/Favorites';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        Mid App
      </Link>
      <div className="nav-links">
        <Link to="/items" className={`nav-link ${location.pathname === '/items' ? 'active' : ''}`}>Items</Link>
        {user ? (
          <>
            <Link to="/favorites" className={`nav-link ${location.pathname === '/favorites' ? 'active' : ''}`}>Favorites</Link>
            <div className="nav-link" style={{ color: 'var(--text-secondary)' }}>|</div>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user.name}</span>
            <button onClick={logout} className="btn btn-secondary">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary">Log In</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <>
      <Navigation />
      <main className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/items" replace />} />
          <Route path="/items" element={<Items />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/favorites"
            element={
              <PrivateRoute>
                <Favorites />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
