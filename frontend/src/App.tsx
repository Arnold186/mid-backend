import React from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Items from './pages/Items';
import Favorites from './pages/Favorites';
import Chat from './pages/Chat';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import TeacherCourses from './pages/TeacherCourses';
import AdminCourses from './pages/AdminCourses';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AppNavigation() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        Mid Learning
      </Link>
      <div className="nav-links">
        <Link to="/courses" className={`nav-link ${isActive('/courses') ? 'active' : ''}`}>
          Courses
        </Link>
        <Link to="/items" className={`nav-link ${isActive('/items') ? 'active' : ''}`}>
          Items
        </Link>
        {user?.role === 'TEACHER' && (
          <Link
            to="/teach/courses"
            className={`nav-link ${isActive('/teach/courses') ? 'active' : ''}`}
          >
            Teach
          </Link>
        )}
        {user?.role === 'ADMIN' && (
          <Link
            to="/admin/courses"
            className={`nav-link ${isActive('/admin/courses') ? 'active' : ''}`}
          >
            Admin
          </Link>
        )}
        {user && (
          <Link
            to="/chat"
            className={`nav-link ${isActive('/chat') ? 'active' : ''}`}
          >
            Chat
          </Link>
        )}
        {user ? (
          <>
            <Link
              to="/favorites"
              className={`nav-link ${isActive('/favorites') ? 'active' : ''}`}
            >
              Favorites
            </Link>
            <div className="nav-link" style={{ color: 'var(--text-secondary)' }}>
              |
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user.name}</span>
            <button onClick={logout} className="btn btn-secondary">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-secondary">
              Log In
            </Link>
            <Link to="/register" className="btn btn-primary">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <>
      <AppNavigation />
      <main className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
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
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            }
          />
          <Route
            path="/teach/courses"
            element={
              <PrivateRoute>
                <TeacherCourses />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <PrivateRoute>
                <AdminCourses />
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
